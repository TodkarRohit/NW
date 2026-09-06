/**
 * Engineering Notes Hub - Authentication & Client API Service
 * Handles:
 * - JWT Token & User session persistence in localStorage
 * - Authenticated HTTP requests (Authorization: Bearer <token>)
 * - User Registration (strict 8-character usernames)
 * - User Login & Logout
 * - Protected & Public API communications:
 *     POST /api/auth/register
 *     POST /api/auth/login
 *     POST /api/auth/logout
 *     GET /api/users
 *     GET /api/resources
 * - Header Auth State UI updates across all pages
 * - Clear, user-friendly error messages (invalid username, duplicate username, network errors, etc.)
 * - 100% Optional login (Public browsing never forced)
 */

(function () {
    // SUPABASE CONFIGURATION - PASTE YOUR URL AND ANON KEY HERE
    const SUPABASE_URL = 'https://qkasthiyysuussaxtkzi.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXN0aGl5eXN1dXNzYXh0a3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjA2MDgsImV4cCI6MjEwMzkzNjYwOH0.Plte859APDo38ybU9vhCqxfHGpq4Idzxj7HCX5aXjvA';

    // Initialize Supabase Client
    // We attach it to window so other files (data.js, script.js) can use it
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const API_BASE_URL = 'http://localhost:5000/api'; // Old API (can be removed later)
    const TOKEN_KEY = 'enh_auth_token';
    const USER_KEY = 'enh_auth_user';

    class AuthService {
        constructor() {
            this.API_BASE_URL = API_BASE_URL;
        }

        getToken() {
            return localStorage.getItem(TOKEN_KEY);
        }

        getUser() {
            try {
                const userJson = localStorage.getItem(USER_KEY);
                return userJson ? JSON.parse(userJson) : null;
            } catch {
                return null;
            }
        }

        isLoggedIn() {
            return !!this.getToken();
        }

        saveSession(token, user) {
            if (token) localStorage.setItem(TOKEN_KEY, token);
            if (user) {
                localStorage.setItem(USER_KEY, JSON.stringify(user));
                const uname = String(user.username || '').toLowerCase();
                const uemail = String(user.email || '').toLowerCase();
                const isAdmin = 
                    user.is_admin === true || 
                    user.is_admin === 'true' || 
                    user.role === 'admin' || 
                    String(user.role || '').toLowerCase() === 'admin' ||
                    uname === 'admin' || 
                    uname === 'rohittodkar92' ||
                    uname.includes('rohittodkar') ||
                    uemail.includes('rohittodkar');

                if (isAdmin) {
                    localStorage.setItem('isAdminMode', 'true');
                } else {
                    localStorage.setItem('isAdminMode', 'false');
                }
            }
            this.updateHeaderUI();
        }

        clearSession() {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.setItem('isAdminMode', 'false');
            this.updateHeaderUI();
        }

        /**
         * Perform an HTTP fetch with optional or enforced JWT authorization header
         */
        async authFetch(endpoint, options = {}) {
            const url = endpoint.startsWith('http') ? endpoint : `${this.API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
            const headers = {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            };

            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const config = {
                ...options,
                headers
            };

            try {
                const response = await fetch(url, config);
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    if (response.status === 401 && token) {
                        this.clearSession();
                    }

                    let friendlyMessage = data.message || `Request failed with status ${response.status}`;
                    if (response.status === 409) {
                        friendlyMessage = 'Duplicate username: An account with this 8-character username already exists.';
                    } else if (response.status === 401 && !token) {
                        friendlyMessage = data.message || 'Invalid username or password. Please check your credentials.';
                    } else if (response.status === 503) {
                        friendlyMessage = 'Database service is currently unavailable. Please verify MongoDB is running.';
                    }

                    const err = new Error(friendlyMessage);
                    err.status = response.status;
                    err.data = data;
                    throw err;
                }

                return data;
            } catch (err) {
                if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
                    throw new Error('Server unavailable: Unable to reach backend on http://localhost:5000. Please ensure the server is running.');
                }
                throw err;
            }
        }

        async hashPassword(password) {
            const msgBuffer = new TextEncoder().encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        async register(username, password, fullName = '', email = '') {
            const cleanName = String(fullName || '').trim();
            const cleanEmail = String(email || '').trim();
            let cleanUser = String(username || '').trim();
            
            if (!cleanUser && cleanEmail) {
                cleanUser = cleanEmail.split('@')[0];
            }
            if (!cleanUser) {
                throw new Error('Please enter a username or email.');
            }
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters long.');
            }

            const password_hash = await this.hashPassword(password);

            const { data, error } = await window.supabaseClient
                .from('users')
                .insert([{ username: cleanUser, password_hash: password_hash, full_name: cleanName, email: cleanEmail }]);

            if (error) {
                if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) { 
                    const r1 = Math.floor(Math.random() * 99) + 1;
                    const r2 = Math.floor(Math.random() * 99) + 1;
                    const r3 = Math.floor(Math.random() * 999) + 100;
                    
                    const suggestions = `${cleanUser}${r1}, ${cleanUser}_${r2}, ${cleanUser}${r3}`;
                    throw new Error(`Username "${cleanUser}" is taken. Try: ${suggestions}`);
                }
                throw new Error(error.message);
            }

            this.saveSession('custom_token_' + cleanUser, { username: cleanUser });

            return { user: { username: cleanUser } };
        }

        async login(username, password) {
            const cleanUser = String(username || '').trim();
            if (!cleanUser) {
                throw new Error('Please enter your username.');
            }
            if (!password) {
                throw new Error('Please enter your password.');
            }

            const password_hash = await this.hashPassword(password);

            const { data, error } = await window.supabaseClient
                .from('users')
                .select('*')
                .or(`username.eq.${cleanUser},email.eq.${cleanUser}`)
                .eq('password_hash', password_hash);

            if (error) {
                throw new Error(error.message);
            }

            if (!data || data.length === 0) {
                throw new Error('Invalid username or password. Please check your credentials.');
            }

            const dbUser = data[0];
            const newCount = (dbUser.login_count || 0) + 1;
            await window.supabaseClient
                .from('users')
                .update({ login_count: newCount, last_login_at: new Date().toISOString() })
                .or(`username.eq.${cleanUser},email.eq.${cleanUser}`);

            this.saveSession('custom_token_' + (dbUser.username || cleanUser), dbUser);

            return { user: dbUser };
        }

        async logout() {
            const user = this.getUser();
            if (user && user.username) {
                try {
                    await window.supabaseClient
                        .from('users')
                        .update({ last_logout_at: new Date().toISOString() })
                        .eq('username', user.username);
                } catch (err) {
                    console.error('Failed to update logout time:', err);
                }
            }
            this.clearSession();
            this.showToast('You have been logged out successfully.');
            setTimeout(() => window.location.reload(), 1000);
        }

        async getUsers() {
            return await this.authFetch('/users', { method: 'GET' });
        }

        async getResources(subject = '', type = '') {
            const params = new URLSearchParams();
            if (subject) params.append('subject', subject);
            if (type) params.append('type', type);
            const query = params.toString() ? `?${params.toString()}` : '';
            return await this.authFetch(`/resources${query}`, { method: 'GET' });
        }

        updateHeaderUI() {
            const user = this.getUser();
            const token = this.getToken();
            const adminToggleBtn = document.getElementById('adminToggleBtn');

            if (user) {
                const uname = String(user.username || '').toLowerCase();
                const uemail = String(user.email || '').toLowerCase();
                const isAdmin = 
                    user.is_admin === true || 
                    user.is_admin === 'true' || 
                    user.role === 'admin' || 
                    String(user.role || '').toLowerCase() === 'admin' ||
                    uname === 'admin' || 
                    uname === 'rohittodkar92' ||
                    uname.includes('rohittodkar') ||
                    uemail.includes('rohittodkar');

                if (isAdmin) {
                    localStorage.setItem('isAdminMode', 'true');
                } else {
                    localStorage.setItem('isAdminMode', 'false');
                }
            } else {
                localStorage.setItem('isAdminMode', 'false');
            }

            if (adminToggleBtn) {
                if (token && user) {
                    adminToggleBtn.classList.add('active');
                    adminToggleBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> <span id="adminBtnText">${escapeHTML(user.username)} (Logout)</span>`;
                    adminToggleBtn.title = `Logged in as ${user.username}. Click to Logout.`;
                } else {
                    adminToggleBtn.classList.remove('active');
                    adminToggleBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> <span id="adminBtnText">Login / Register</span>`;
                    adminToggleBtn.title = 'Click to login or create a student account';
                }
            }

            try {
                window.dispatchEvent(new CustomEvent('auth_state_changed'));
            } catch (e) {}
        }

        showToast(message) {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            if (!toast) return;

            if (toastMessage) {
                toastMessage.textContent = message;
            }
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3200);
        }
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Expose AuthService class and singleton instance globally
    window.AuthService = AuthService;
    window.authService = new AuthService();

    // ---------------------------------------------------------
    // Supabase Realtime Synchronization Service
    // Handles real-time folder/file additions, updates, deletions
    // ---------------------------------------------------------
    let realtimeChannel = null;
    const registeredRealtimeCallbacks = [];

    function initSupabaseRealtime() {
        if (!window.supabaseClient) return;

        try {
            realtimeChannel = window.supabaseClient.channel('academic_hub_realtime', {
                config: { broadcast: { self: false } }
            });

            realtimeChannel
                .on('broadcast', { event: 'academic_state_updated' }, async (payload) => {
                    await pullLatestStateFromSupabase();
                    registeredRealtimeCallbacks.forEach(cb => {
                        try { cb(payload); } catch (e) {}
                    });
                })
                .subscribe();
        } catch (e) {
            console.warn('Realtime channel init warning:', e);
        }

        // Periodic Fallback Sync Check (every 6 seconds)
        let lastSyncCheck = 0;
        setInterval(async () => {
            const now = Date.now();
            if (now - lastSyncCheck > 5000) {
                lastSyncCheck = now;
                const updated = await checkStateUpdateTimestamp();
                if (updated) {
                    registeredRealtimeCallbacks.forEach(cb => {
                        try { cb(); } catch (e) {}
                    });
                }
            }
        }, 6000);
    }

    async function pullLatestStateFromSupabase() {
        if (!window.supabaseClient) return;
        try {
            const { data: urlData } = window.supabaseClient.storage
                .from('academic-files')
                .getPublicUrl('published_state/app_data.json');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            const res = await fetch(urlData.publicUrl + '?t=' + Date.now(), { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const publishedData = await res.json();
                
                let cloudDeleted = [];
                try { cloudDeleted = JSON.parse(publishedData['deleted_keys_global'] || '[]'); } catch (e) {}
                let localDeleted = [];
                try { localDeleted = JSON.parse(localStorage.getItem('deleted_keys_global') || '[]'); } catch (e) {}
                const mergedDeleted = Array.from(new Set([...cloudDeleted, ...localDeleted]));
                localStorage.setItem('deleted_keys_global', JSON.stringify(mergedDeleted));

                mergedDeleted.forEach(delKey => {
                    localStorage.removeItem(delKey);
                });

                for (const key in publishedData) {
                    if (!mergedDeleted.includes(key)) {
                        localStorage.setItem(key, publishedData[key]);
                    }
                }

                if (typeof loadCustomSubjectsIntoData === 'function') {
                    loadCustomSubjectsIntoData();
                }
            }
        } catch (e) {
            console.warn('Error pulling state from Supabase:', e);
        }
    }

    let lastKnownTimestamp = 0;
    async function checkStateUpdateTimestamp() {
        if (!window.supabaseClient) return false;
        try {
            const { data } = await window.supabaseClient.storage
                .from('academic-files')
                .list('published_state', { search: 'app_data.json' });

            if (data && data.length > 0) {
                const fileInfo = data[0];
                const updatedTime = new Date(fileInfo.updated_at || fileInfo.created_at).getTime();
                if (updatedTime > lastKnownTimestamp) {
                    if (lastKnownTimestamp > 0) {
                        lastKnownTimestamp = updatedTime;
                        await pullLatestStateFromSupabase();
                        return true;
                    }
                    lastKnownTimestamp = updatedTime;
                }
            }
        } catch (e) {}
        return false;
    }

    async function pushAndBroadcastStateChange() {
        if (!window.supabaseClient) return;

        const exportData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
                key.startsWith('doc_upload_') ||
                key.startsWith('custom_items_') ||
                key.startsWith('modified_items_') ||
                key.startsWith('custom_assignments_') ||
                key.startsWith('deleted_keys_') ||
                key.startsWith('custom_subjects_') ||
                key.startsWith('modified_subjects_') ||
                key.startsWith('deleted_subjects_') ||
                key.startsWith('custom_branches_') ||
                key.startsWith('modified_branches_') ||
                key.startsWith('deleted_branches_')
            ) {
                exportData[key] = localStorage.getItem(key);
            }
        }

        const jsonString = JSON.stringify(exportData);
        const blob = new Blob([jsonString], { type: 'application/json' });

        try {
            await window.supabaseClient.storage
                .from('academic-files')
                .upload('published_state/app_data.json', blob, { contentType: 'application/json', upsert: true });

            if (realtimeChannel) {
                await realtimeChannel.send({
                    type: 'broadcast',
                    event: 'academic_state_updated',
                    payload: { timestamp: Date.now() }
                });
            }
        } catch (e) {
            console.error('Error broadcasting state change to Supabase:', e);
        }
    }

    async function deleteSupabaseFolder(folderPath) {
        if (!window.supabaseClient || !folderPath) return;
        try {
            const listAllFiles = async (path) => {
                const { data: items } = await window.supabaseClient.storage
                    .from('academic-files')
                    .list(path);
                if (!items || items.length === 0) return [];
                let files = [];
                for (const item of items) {
                    const itemPath = path ? `${path}/${item.name}` : item.name;
                    if (item.id) {
                        files.push(itemPath);
                    } else {
                        const subFiles = await listAllFiles(itemPath);
                        files = files.concat(subFiles);
                    }
                }
                return files;
            };

            const filesToRemove = await listAllFiles(folderPath);
            if (filesToRemove.length > 0) {
                await window.supabaseClient.storage
                    .from('academic-files')
                    .remove(filesToRemove);
            }
        } catch (err) {
            console.error(`Error deleting Supabase folder "${folderPath}":`, err);
        }
    }

    window.supabaseRealtime = {
        subscribe: function (callback) {
            if (typeof callback === 'function' && !registeredRealtimeCallbacks.includes(callback)) {
                registeredRealtimeCallbacks.push(callback);
            }
        },
        pushAndBroadcast: pushAndBroadcastStateChange,
        pullLatest: pullLatestStateFromSupabase,
        deleteFolder: deleteSupabaseFolder
    };

    // Initialize once DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        authService.updateHeaderUI();
        initSupabaseRealtime();
    });
})();




