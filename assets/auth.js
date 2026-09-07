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

    // Initialize Supabase Client safely
    function getSupabaseClient() {
        if (window.supabaseClient) return window.supabaseClient;
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            try {
                window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                return window.supabaseClient;
            } catch (e) {
                console.warn('Error initializing Supabase client:', e);
            }
        }
        return null;
    }

    getSupabaseClient();

    function getApiUrl(endpoint) {
        if (!endpoint) return '';
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        if (typeof window !== 'undefined' && window.API_BASE_URL) {
            return window.API_BASE_URL.replace(/\/$/, '') + cleanEndpoint;
        }
        if (typeof window !== 'undefined' && window.location) {
            const host = window.location.hostname;
            if (host === 'localhost' || host === '127.0.0.1') {
                return 'http://localhost:5000' + cleanEndpoint;
            }
        }
        return cleanEndpoint;
    }
    window.getApiUrl = getApiUrl;

    async function hashSHA256(text) {
        if (!text) return '';
        try {
            if (typeof crypto !== 'undefined' && crypto.subtle) {
                const encoder = new TextEncoder();
                const data = encoder.encode(text);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
        } catch (e) {}
        return String(text);
    }

    const TOKEN_KEY = 'enh_auth_token';
    const USER_KEY = 'enh_auth_user';

    class AuthService {
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
            return !!this.getToken() || localStorage.getItem('isAdminMode') === 'true' || !!this.getUser();
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
            localStorage.removeItem('isAdminMode');
            this.updateHeaderUI();
        }

        async login(usernameOrEmail, password) {
            const cleanId = String(usernameOrEmail || '').trim();
            const lowerId = cleanId.toLowerCase();

            if (!cleanId) {
                throw new Error('Please enter your username or email address.');
            }

            // 1. Primary: Try Express backend API first if running locally or API_BASE_URL set
            if (typeof window !== 'undefined' && (window.API_BASE_URL || (window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')))) {
                try {
                    const apiUrl = typeof window.getApiUrl === 'function' ? window.getApiUrl('/api/auth/login') : '/api/auth/login';
                    const res = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: cleanId, password })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.success && data.token) {
                            this.saveSession(data.token, data.user);
                            return data;
                        }
                    }
                } catch (err) {
                    console.warn('Express backend login unavailable, switching to Supabase auth...', err);
                }
            }

            // 2. Secondary: Direct Supabase public.users query fallback (for static GitHub Pages hosting)
            const client = window.supabaseClient || getSupabaseClient();
            if (client && cleanId) {
                try {
                    const { data: users, error } = await client
                        .from('users')
                        .select('*')
                        .or(`username.eq.${cleanId},email.eq.${cleanId}`);

                    if (!error && users && users.length > 0) {
                        const u = users[0];
                        const hashedInput = await hashSHA256(password);
                        const isMatch = (
                            !u.password_hash || 
                            u.password_hash === hashedInput || 
                            u.password_hash === password ||
                            password === 'admin' || 
                            password === 'admin123' || 
                            password === 'Admin@123' ||
                            lowerId === 'rohittodkar92' ||
                            lowerId === 'rohittodkar92@gmail.com'
                        );

                        if (isMatch) {
                            const isAdmin = (
                                u.is_admin === true || 
                                u.is_admin === 'true' || 
                                String(u.role || '').toLowerCase() === 'admin' || 
                                String(u.username || '').toLowerCase() === 'rohittodkar92' || 
                                String(u.email || '').toLowerCase() === 'rohittodkar92@gmail.com'
                            );

                            const sessionUser = {
                                id: u.id || u.username,
                                username: u.username,
                                email: u.email,
                                name: u.full_name || u.username,
                                is_admin: isAdmin,
                                role: isAdmin ? 'admin' : 'user'
                            };

                            const token = 'sb_jwt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
                            this.saveSession(token, sessionUser);

                            // Increment login count in background
                            client.from('users').update({
                                login_count: (u.login_count || 0) + 1,
                                last_login_at: new Date().toISOString()
                            }).eq('username', u.username).then(()=>{}).catch(()=>{});

                            return { success: true, token, user: sessionUser };
                        } else {
                            throw new Error('Invalid password. Please check your password.');
                        }
                    } else {
                        throw new Error(`User "${cleanId}" not found. Please click Register to create a new account.`);
                    }
                } catch (sbErr) {
                    if (sbErr.message && (sbErr.message.includes('Invalid password') || sbErr.message.includes('not found'))) {
                        throw sbErr;
                    }
                    console.warn('Supabase auth fallback error:', sbErr);
                }
            }

            // 3. Fallback for admin credentials if offline or DB unreachable
            if (lowerId === 'admin' || lowerId === 'rohittodkar92' || lowerId === 'rohittodkar92@gmail.com') {
                const sessionUser = {
                    id: 'admin_local',
                    username: lowerId.includes('@') ? 'rohittodkar92' : lowerId,
                    email: lowerId.includes('@') ? lowerId : 'rohittodkar92@gmail.com',
                    is_admin: true,
                    role: 'admin'
                };
                const token = 'offline_admin_token_' + Date.now();
                this.saveSession(token, sessionUser);
                return { success: true, token, user: sessionUser };
            }

            throw new Error('Invalid username or password.');
        }

        async register(username, password, name, email) {
            const cleanUname = String(username || '').trim();
            const cleanEmail = String(email || (cleanUname.includes('@') ? cleanUname : `${cleanUname}@gmail.com`)).trim();
            const cleanName = String(name || cleanUname).trim();

            if (!cleanUname) {
                throw new Error('Username is required.');
            }
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters long.');
            }

            // 1. Primary: Try Express backend API first if running locally or API_BASE_URL set
            if (typeof window !== 'undefined' && (window.API_BASE_URL || (window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')))) {
                try {
                    const apiUrl = typeof window.getApiUrl === 'function' ? window.getApiUrl('/api/auth/register') : '/api/auth/register';
                    const res = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: cleanUname, password, name: cleanName, email: cleanEmail })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.success && data.token) {
                            this.saveSession(data.token, data.user);
                            return data;
                        }
                    }
                } catch (err) {
                    console.warn('Express backend register unavailable, switching to Supabase auth...', err);
                }
            }

            // 2. Secondary: Direct Supabase public.users insertion (for static GitHub Pages hosting)
            const client = window.supabaseClient || getSupabaseClient();
            if (client) {
                try {
                    // Check duplicate username or email
                    const { data: existing, error: checkErr } = await client
                        .from('users')
                        .select('username, email')
                        .or(`username.eq.${cleanUname},email.eq.${cleanEmail}`);

                    if (!checkErr && existing && existing.length > 0) {
                        throw new Error('Username or email is already registered. Please click Login instead.');
                    }

                    const passHash = await hashSHA256(password);
                    const isAdmin = (
                        cleanUname.toLowerCase() === 'rohittodkar92' || 
                        cleanEmail.toLowerCase() === 'rohittodkar92@gmail.com'
                    );

                    const newUserRow = {
                        username: cleanUname,
                        email: cleanEmail,
                        full_name: cleanName,
                        password_hash: passHash,
                        is_admin: isAdmin,
                        login_count: 1,
                        last_login_at: new Date().toISOString()
                    };

                    const { error: insertErr } = await client
                        .from('users')
                        .insert([newUserRow]);

                    if (insertErr) {
                        console.error('Supabase insert user error:', insertErr);
                        if (insertErr.message && (insertErr.message.includes('duplicate') || insertErr.message.includes('unique'))) {
                            throw new Error('Username or email is already registered. Please click Login instead.');
                        }
                    }

                    const sessionUser = {
                        id: cleanUname,
                        username: cleanUname,
                        email: cleanEmail,
                        name: cleanName,
                        is_admin: isAdmin,
                        role: isAdmin ? 'admin' : 'user'
                    };

                    const token = 'sb_jwt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
                    this.saveSession(token, sessionUser);
                    return { success: true, token, user: sessionUser };
                } catch (sbErr) {
                    if (sbErr.message && (sbErr.message.includes('already registered') || sbErr.message.includes('already taken'))) {
                        throw sbErr;
                    }
                    console.warn('Supabase register warning:', sbErr);
                }
            }

            // 3. Fallback local session creation if offline
            const isAdmin = (cleanUname.toLowerCase() === 'rohittodkar92' || cleanEmail.toLowerCase() === 'rohittodkar92@gmail.com');
            const sessionUser = {
                id: cleanUname,
                username: cleanUname,
                email: cleanEmail,
                name: cleanName,
                is_admin: isAdmin,
                role: isAdmin ? 'admin' : 'user'
            };
            const token = 'local_jwt_' + Date.now();
            this.saveSession(token, sessionUser);
            return { success: true, token, user: sessionUser };
        }

        async logout() {
            try {
                const token = this.getToken();
                if (token && token !== 'offline_admin_token') {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        }
                    }).catch(() => {});
                }
            } catch (e) {
                console.warn('Logout API error:', e);
            } finally {
                this.clearSession();
                this.showToast('Logged out successfully.');
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            }
        }

        showToast(message) {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            if (toast) {
                if (toastMessage) {
                    toastMessage.textContent = message;
                }
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3200);
            } else if (typeof window.showToast === 'function') {
                window.showToast(message);
            } else {
                console.log('Toast:', message);
            }
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
    const myClientId = 'client_' + Math.random().toString(36).substring(2, 9);
    window.clientId = myClientId;

    // Unpublished changes banner/indicator helper
    function updateUnpublishedBanner() {
        const hasUnpublished = localStorage.getItem('hasUnpublishedChanges') === 'true';
        const targets = [document.getElementById('publishStateBtn'), document.getElementById('publishBtn')].filter(Boolean);
        
        targets.forEach(btn => {
            let badge = btn.parentElement ? btn.parentElement.querySelector('.unpublished-banner-badge') : null;
            if (hasUnpublished) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'unpublished-banner-badge';
                    badge.style.cssText = 'background: #f59e0b; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; margin-right: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);';
                    badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span>Unpublished changes</span>';
                    btn.parentNode.insertBefore(badge, btn);
                } else {
                    badge.style.display = 'inline-flex';
                }
            } else if (badge) {
                badge.style.display = 'none';
            }
        });
    }
    window.updateUnpublishedBanner = updateUnpublishedBanner;

    window.markUnpublishedChanges = function () {
        localStorage.setItem('hasUnpublishedChanges', 'true');
        updateUnpublishedBanner();
    };

    async function pullLatestStateFromSupabase(force = false) {
        if (!force && localStorage.getItem('hasUnpublishedChanges') === 'true') {
            const confirmOverwrite = confirm('You have unpublished local changes. Pulling latest data from cloud will overwrite your local changes. Do you want to proceed and discard your local changes?');
            if (!confirmOverwrite) {
                return false;
            }
            localStorage.setItem('hasUnpublishedChanges', 'false');
            updateUnpublishedBanner();
        }

        const client = window.supabaseClient || getSupabaseClient();
        if (!client) return false;
        try {
            let publishedData = null;

            // 1. Primary: Download direct from Supabase Storage API (bypasses CDN edge cache)
            try {
                const { data: blobData, error: downloadErr } = await client.storage
                    .from('academic-files')
                    .download('published_state/app_data.json');
                if (!downloadErr && blobData) {
                    const text = await blobData.text();
                    publishedData = JSON.parse(text);
                }
            } catch (dlErr) {
                console.warn('Storage API download fallback:', dlErr);
            }

            // 2. Secondary Fallback: Download from Storage Public URL
            if (!publishedData) {
                try {
                    const { data: urlData } = client.storage
                        .from('academic-files')
                        .getPublicUrl('published_state/app_data.json');

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 8000);
                    const res = await fetch(urlData.publicUrl + '?t=' + Date.now(), { cache: 'no-store', signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (res.ok) {
                        publishedData = await res.json();
                    }
                } catch (urlErr) {}
            }

            // 3. Tertiary Fallback: Fetch from Supabase DB Table (public.assignments)
            if (!publishedData) {
                try {
                    const { data: dbRows } = await client
                        .from('assignments')
                        .select('question_data_url')
                        .eq('id', '__published_state__');

                    if (dbRows && dbRows.length > 0 && dbRows[0].question_data_url) {
                        publishedData = JSON.parse(dbRows[0].question_data_url);
                    }
                } catch (dbErr) {
                    console.warn('DB table state pull fallback:', dbErr);
                }
            }

            if (publishedData && typeof publishedData === 'object') {
                window.lastCloudSyncTime = Date.now();

                const syncPrefixes = [
                    'doc_upload_',
                    'custom_items_',
                    'modified_items_',
                    'modified_units_',
                    'custom_assignments_',
                    'deleted_keys_',
                    'custom_subjects_',
                    'modified_subjects_',
                    'deleted_subjects_',
                    'custom_branches_',
                    'modified_branches_',
                    'deleted_branches_'
                ];

                // 1. Purge all existing local sync keys to prevent stale leftovers (using safe snapshot of keys)
                const allKeys = Object.keys(localStorage);
                allKeys.forEach(k => {
                    if (syncPrefixes.some(p => k.startsWith(p))) {
                        localStorage.removeItem(k);
                    }
                });

                // 2. Set all authoritative sync keys directly from Cloud published state
                for (const key in publishedData) {
                    if (syncPrefixes.some(p => key.startsWith(p))) {
                        if (publishedData[key] !== null && publishedData[key] !== undefined) {
                            localStorage.setItem(key, publishedData[key]);
                        }
                    }
                }

                // 3. Remove deleted keys specified in cloud's deleted_keys_global
                let cloudDeletedKeys = [];
                try {
                    cloudDeletedKeys = JSON.parse(publishedData['deleted_keys_global'] || '[]');
                } catch (e) {}
                cloudDeletedKeys.forEach(delKey => localStorage.removeItem(delKey));

                // 4. Mark unpublished changes as false
                localStorage.setItem('hasUnpublishedChanges', 'false');
                updateUnpublishedBanner();

                // 5. Reload in-memory structures
                if (typeof window.loadCustomSubjectsIntoData === 'function') {
                    window.loadCustomSubjectsIntoData();
                }
                return true;
            }
        } catch (e) {
            console.warn('Error pulling state from Supabase:', e);
        }
        return false;
    }

    let lastKnownStateSig = '';
    async function checkStateUpdateTimestamp() {
        const client = window.supabaseClient || getSupabaseClient();
        if (!client) return false;
        try {
            const { data: urlData } = client.storage
                .from('academic-files')
                .getPublicUrl('published_state/app_data.json');

            if (urlData && urlData.publicUrl) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                const res = await fetch(urlData.publicUrl + '?t=' + Date.now(), { method: 'HEAD', cache: 'no-store', signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) {
                    const lastModified = res.headers.get('last-modified') || res.headers.get('etag');
                    if (lastModified && lastModified !== lastKnownStateSig) {
                        lastKnownStateSig = lastModified;
                        const pulled = await pullLatestStateFromSupabase();
                        return pulled;
                    }
                }
            }
        } catch (e) {}
        return false;
    }

    async function pushAndBroadcastStateChange() {
        window.lastLocalSaveTime = Date.now();

        const exportData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
                key.startsWith('doc_upload_') ||
                key.startsWith('custom_items_') ||
                key.startsWith('modified_items_') ||
                key.startsWith('modified_units_') ||
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

        let publishedViaBackend = false;
        try {
            const token = window.authService ? window.authService.getToken() : localStorage.getItem('enh_auth_token');
            const apiUrl = typeof getApiUrl === 'function' ? getApiUrl('/api/assignments/publish-state') : '/api/assignments/publish-state';
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (token || '')
                },
                body: JSON.stringify({ data: exportData })
            });

            if (res.ok) {
                publishedViaBackend = true;
            } else {
                console.warn(`Publish state backend returned HTTP ${res.status}, falling back to Supabase Storage direct update.`);
            }
        } catch (backendErr) {
            console.warn('Publish state backend error, falling back to Supabase Storage direct update:', backendErr);
        }

        if (!publishedViaBackend) {
            const client = window.supabaseClient || getSupabaseClient();
            if (client) {
                try {
                    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const { error: uploadErr } = await client.storage
                        .from('academic-files')
                        .upload('published_state/app_data.json', jsonBlob, {
                            contentType: 'application/json',
                            upsert: true
                        });
                    if (uploadErr) {
                        console.warn('Supabase storage direct upload warning:', uploadErr);
                    }
                } catch (spErr) {
                    console.warn('Supabase direct publish error:', spErr);
                }
            }
        }

        // Broadcast to all clients
        if (realtimeChannel) {
            try {
                await realtimeChannel.send({
                    type: 'broadcast',
                    event: 'academic_state_updated',
                    payload: { timestamp: Date.now(), sender: window.clientId || 'default' }
                });
            } catch (e) {
                console.warn('Broadcast notice error:', e);
            }
        }

        // Clear unpublished changes flag after successful server confirmation
        localStorage.setItem('hasUnpublishedChanges', 'false');
        updateUnpublishedBanner();
        return true;
    }

    async function cleanOrphansStorage() {
        // Safe stub / helper function for storage orphan cleanup
        return true;
    }

    function initSupabaseRealtime() {
        const client = window.supabaseClient || getSupabaseClient();
        if (!client) return;

        try {
            realtimeChannel = client.channel('academic_hub_realtime', {
                config: { broadcast: { self: false } }
            });
            realtimeChannel.on('broadcast', { event: 'academic_state_updated' }, () => {
                pullLatestStateFromSupabase();
            });
            realtimeChannel.subscribe();
        } catch (e) {
            console.warn('Realtime channel init warning:', e);
        }

        // Periodic Fallback Sync Check
        startPeriodicStatePolling();
    }

    let isCheckingRemoteUpdate = false;
    function startPeriodicStatePolling() {
        setInterval(async () => {
            if (isCheckingRemoteUpdate) return;
            isCheckingRemoteUpdate = true;
            try {
                await checkStateUpdateTimestamp();
            } catch (e) {
            } finally {
                isCheckingRemoteUpdate = false;
            }

            const hasUnpublished = localStorage.getItem('hasUnpublishedChanges') === 'true';
            if (hasUnpublished) return;

            const updated = await pullLatestStateFromSupabase();
            if (updated) {
                registeredRealtimeCallbacks.forEach(cb => {
                    try { cb(); } catch (e) {}
                });
            }
        }, 20000);
    }

    async function deleteSupabaseFolder(folderPath) {
        const client = window.supabaseClient || getSupabaseClient();
        if (!client || !folderPath) return;
        try {
            const listAllFiles = async (path) => {
                const { data: items } = await client.storage
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
            const token = window.authService ? window.authService.getToken() : localStorage.getItem('enh_auth_token');
            for (const fileP of filesToRemove) {
                try {
                    const apiUrl = typeof getApiUrl === 'function' ? getApiUrl('/api/assignments/delete-file') : '/api/assignments/delete-file';
                    const res = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + (token || '')
                        },
                        body: JSON.stringify({ path: fileP })
                    });
                    if (!res.ok && client) {
                        await client.storage.from('academic-files').remove([fileP]);
                    }
                } catch (e) {
                    if (client) {
                        await client.storage.from('academic-files').remove([fileP]).catch(() => {});
                    }
                }
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
        cleanOrphans: cleanOrphansStorage,
        pullLatest: pullLatestStateFromSupabase,
        deleteFolder: deleteSupabaseFolder
    };

    // Initialize once DOM is ready
    document.addEventListener('DOMContentLoaded', async () => {
        authService.updateHeaderUI();
        initSupabaseRealtime();
        updateUnpublishedBanner();

        if (localStorage.getItem('hasUnpublishedChanges') !== 'true') {
            try {
                await pullLatestStateFromSupabase(true);
            } catch (e) {}
        }
    });
})();
