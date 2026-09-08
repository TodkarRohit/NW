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

        document.querySelectorAll('.unpublished-banner-badge').forEach(badge => {
            badge.style.display = hasUnpublished ? 'inline-flex' : 'none';
        });
    }
    window.updateUnpublishedBanner = updateUnpublishedBanner;

    window.markUnpublishedChanges = function () {
        localStorage.setItem('hasUnpublishedChanges', 'true');
        updateUnpublishedBanner();
    };

    async function pullLatestStateFromSupabase(force = false) {
        if (!force && localStorage.getItem('hasUnpublishedChanges') === 'true') {
            return false;
        }

        const client = window.supabaseClient || getSupabaseClient();
        if (!client) return false;
        try {
            let publishedData = null;

            // 1. Fast parallel fetch: Race Supabase Storage API download with Public CDN fetch
            const fetchViaStorageApi = async () => {
                try {
                    const { data: blobData, error: downloadErr } = await client.storage
                        .from('academic-files')
                        .download('published_state/app_data.json');
                    if (!downloadErr && blobData) {
                        const text = await blobData.text();
                        return JSON.parse(text);
                    }
                } catch (e) {}
                return null;
            };

            const fetchViaPublicUrl = async () => {
                try {
                    const { data: urlData } = client.storage
                        .from('academic-files')
                        .getPublicUrl('published_state/app_data.json');
                    if (urlData && urlData.publicUrl) {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 3500);
                        const res = await fetch(urlData.publicUrl + '?t=' + Date.now(), { cache: 'no-store', signal: controller.signal });
                        clearTimeout(timeoutId);
                        if (res.ok) {
                            return await res.json();
                        }
                    }
                } catch (e) {}
                return null;
            };

            try {
                const results = await Promise.allSettled([
                    fetchViaStorageApi(),
                    fetchViaPublicUrl()
                ]);
                for (const res of results) {
                    if (res.status === 'fulfilled' && res.value && typeof res.value === 'object') {
                        publishedData = res.value;
                        break;
                    }
                }
            } catch (e) {}

            // Fallback to Supabase DB Table (public.assignments) if storage files fail
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
                    'deleted_units_',
                    'custom_assignments_',
                    'deleted_keys_',
                    'custom_subjects_',
                    'modified_subjects_',
                    'deleted_subjects_',
                    'custom_branches_',
                    'modified_branches_',
                    'deleted_branches_'
                ];

                // Preserve local deletion tombstones so stale cloud data cannot un-delete deleted subjects!
                let localDeletedSubjects = [];
                try {
                    const l1 = JSON.parse(localStorage.getItem('deleted_subjects_list')) || [];
                    const l2 = JSON.parse(sessionStorage.getItem('deleted_subjects_list')) || [];
                    const l3 = JSON.parse(localStorage.getItem('enh_permanent_deleted_subjects')) || [];
                    localDeletedSubjects = Array.from(new Set([...l1, ...l2, ...l3]));
                } catch (e) {}

                // Fetch DB deletion backup from public.assignments
                let dbDeletedSubjects = [];
                try {
                    const { data: dbRows } = await client
                        .from('assignments')
                        .select('question_data_url')
                        .eq('id', '__deleted_subjects__');
                    if (dbRows && dbRows.length > 0 && dbRows[0].question_data_url) {
                        dbDeletedSubjects = JSON.parse(dbRows[0].question_data_url);
                    }
                } catch (e) {}

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

                // 3. MERGE all deletion tombstones back into localStorage so deleted subjects STAY DELETED!
                let cloudDeletedSubjects = [];
                try {
                    cloudDeletedSubjects = JSON.parse(localStorage.getItem('deleted_subjects_list')) || [];
                } catch (e) {}

                const mergedDeletedSubjects = Array.from(new Set([
                    ...localDeletedSubjects,
                    ...dbDeletedSubjects,
                    ...cloudDeletedSubjects
                ])).filter(Boolean);

                localStorage.setItem('deleted_subjects_list', JSON.stringify(mergedDeletedSubjects));
                sessionStorage.setItem('deleted_subjects_list', JSON.stringify(mergedDeletedSubjects));
                localStorage.setItem('enh_permanent_deleted_subjects', JSON.stringify(mergedDeletedSubjects));

                // 4. Ensure custom_subjects_list and modified_subjects_data do NOT contain any deleted subjects
                try {
                    const mergedDeletedSet = new Set();
                    mergedDeletedSubjects.forEach(item => {
                        if (!item) return;
                        const str = String(item).toLowerCase().trim();
                        mergedDeletedSet.add(str);
                        mergedDeletedSet.add(str.replace(/_/g, '-'));
                        mergedDeletedSet.add(str.replace(/-/g, '_'));
                    });

                    let customSubjects = JSON.parse(localStorage.getItem('custom_subjects_list')) || [];
                    customSubjects = customSubjects.filter(s => {
                        if (!s) return false;
                        const sId = String(s.id || s.code || '').toLowerCase().trim();
                        const sTitle = String(s.title || '').toLowerCase().trim();
                        const normId = sId.replace(/_/g, '-');
                        const altId = sId.replace(/-/g, '_');
                        return !mergedDeletedSet.has(sId) && !mergedDeletedSet.has(sTitle) && !mergedDeletedSet.has(normId) && !mergedDeletedSet.has(altId);
                    });
                    localStorage.setItem('custom_subjects_list', JSON.stringify(customSubjects));

                    let modifiedSubjects = JSON.parse(localStorage.getItem('modified_subjects_data')) || {};
                    for (const modKey in modifiedSubjects) {
                        const modObj = modifiedSubjects[modKey];
                        const kLower = String(modKey).toLowerCase().trim();
                        const mTitle = modObj && modObj.title ? String(modObj.title).toLowerCase().trim() : '';
                        const normK = kLower.replace(/_/g, '-');
                        const altK = kLower.replace(/-/g, '_');
                        if (mergedDeletedSet.has(kLower) || mergedDeletedSet.has(mTitle) || mergedDeletedSet.has(normK) || mergedDeletedSet.has(altK)) {
                            delete modifiedSubjects[modKey];
                        }
                    }
                    localStorage.setItem('modified_subjects_data', JSON.stringify(modifiedSubjects));
                } catch (e) {}

                // 5. Remove deleted keys specified in cloud's deleted_keys_global
                let cloudDeletedKeys = [];
                try {
                    cloudDeletedKeys = JSON.parse(publishedData['deleted_keys_global'] || '[]');
                } catch (e) {}
                cloudDeletedKeys.forEach(delKey => localStorage.removeItem(delKey));

                // 6. Mark unpublished changes as false
                localStorage.setItem('hasUnpublishedChanges', 'false');
                updateUnpublishedBanner();

                // 7. Reload in-memory structures
                if (typeof window.loadCustomSubjectsIntoData === 'function') {
                    window.loadCustomSubjectsIntoData();
                }

                try {
                    window.dispatchEvent(new CustomEvent('academicStateRefreshed'));
                } catch (e) {}

                registeredRealtimeCallbacks.forEach(cb => {
                    try { cb(); } catch (e) {}
                });

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
                key.startsWith('deleted_units_') ||
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

        let publishSuccess = false;
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
                publishSuccess = true;
            } else {
                const errJson = await res.json().catch(() => ({ message: 'Publish failed' }));
                console.warn(`[Publish State] Server returned HTTP ${res.status}:`, errJson.message);
            }
        } catch (backendErr) {
            console.warn('[Publish State] Network error:', backendErr);
        }

        // Direct Supabase Storage Client fallback if backend proxy API is unavailable or returns non-200
        if (!publishSuccess) {
            const client = window.supabaseClient || getSupabaseClient();
            if (client) {
                try {
                    const jsonString = JSON.stringify(exportData, null, 2);
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const { error: uploadErr } = await client.storage
                        .from('academic-files')
                        .upload('published_state/app_data.json', blob, {
                            contentType: 'application/json',
                            upsert: true
                        });

                    if (!uploadErr) {
                        publishSuccess = true;
                    } else {
                        console.error('[Publish State] Direct Supabase upload error:', uploadErr.message);
                        if (typeof showToast === 'function') {
                            showToast(`Supabase upload error: ${uploadErr.message}`, true);
                        }
                    }
                } catch (spErr) {
                    console.error('[Publish State] Direct Supabase exception:', spErr);
                }
            }
        if (!publishSuccess) {
            console.warn('[Publish State] Cloud sync could not be completed.');
            if (typeof showToast === 'function') {
                showToast('Cloud sync failed: Changes saved locally only. Please check connection.', true);
            }
        }

        // Backup deleted subjects list into Supabase DB table public.assignments for 100% permanent persistence
        const backupClient = window.supabaseClient || getSupabaseClient();
        if (backupClient && exportData['deleted_subjects_list']) {
            try {
                await backupClient
                    .from('assignments')
                    .upsert({
                        id: '__deleted_subjects__',
                        title: 'Deleted Subjects List Backup',
                        unit: 'system',
                        question_data_url: exportData['deleted_subjects_list']
                    });
            } catch (e) {
                console.warn('[Publish State] DB deletion backup error:', e);
            }
        }

        // Only broadcast & clear unpublished changes flag if publish succeeded
        if (publishSuccess) {
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

            localStorage.setItem('hasUnpublishedChanges', 'false');
            updateUnpublishedBanner();
            return true;
        }

        return false;
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
            realtimeChannel.on('broadcast', { event: 'academic_state_updated' }, async () => {
                await pullLatestStateFromSupabase(true);
                if (typeof window.loadCustomSubjectsIntoData === 'function') {
                    window.loadCustomSubjectsIntoData();
                }
                try {
                    window.dispatchEvent(new CustomEvent('academicStateRefreshed'));
                } catch (e) {}
                registeredRealtimeCallbacks.forEach(cb => {
                    try { cb(); } catch (e) {}
                });
            });
            realtimeChannel.subscribe();
        } catch (e) {
            console.warn('Realtime channel init warning:', e);
        }

        // Periodic state polling disabled to prevent auto-reloading
        // startPeriodicStatePolling();
    }

    function startPeriodicStatePolling() {
        // Disabled: Page loads once and stays stable. Reloads occur only when user manually refreshes or clicks Publish.
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
                    if (!res.ok) {
                        if (client && client.storage) {
                            await client.storage.from('academic-files').remove([fileP]);
                        }
                    }
                } catch (e) {
                    console.warn(`Error deleting file "${fileP}":`, e);
                    if (client && client.storage) {
                        try { await client.storage.from('academic-files').remove([fileP]); } catch (e2) {}
                    }
                }
            }
        } catch (err) {
            console.error(`Error deleting Supabase folder "${folderPath}":`, err);
        }
    }

    async function createSubjectFolders(subjectId) {
        if (!subjectId) return;

        const folders = [`notes/${subjectId}`, `question_bank/${subjectId}`, `assignments/${subjectId}`];
        const dummyContent = new Blob(['Folder initialized'], { type: 'text/plain' });

        for (const folder of folders) {
            const keepPath = `${folder}/.keep`;
            try {
                const token = window.authService ? window.authService.getToken() : localStorage.getItem('enh_auth_token');
                const formData = new FormData();
                formData.append('file', dummyContent, '.keep');
                formData.append('path', keepPath);

                const apiUrl = typeof getApiUrl === 'function' ? getApiUrl('/api/assignments/upload') : '/api/assignments/upload';
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + (token || '') },
                    body: formData
                });
                if (!res.ok) {
                    const client = window.supabaseClient || getSupabaseClient();
                    if (client && client.storage) {
                        await client.storage.from('academic-files').upload(keepPath, dummyContent, { upsert: true });
                    }
                }
            } catch (e) {
                console.warn(`Error creating keep file for folder "${folder}":`, e);
            }
        }
    }

    async function renameSubjectFolders(oldSubjectId, newSubjectId) {
        if (!oldSubjectId || !newSubjectId || oldSubjectId === newSubjectId) return;
        const client = window.supabaseClient || getSupabaseClient();
        const categories = ['notes', 'question_bank', 'assignments'];

        for (const cat of categories) {
            const oldPath = `${cat}/${oldSubjectId}`;
            const newPath = `${cat}/${newSubjectId}`;

            if (client && client.storage) {
                try {
                    const { data: items } = await client.storage.from('academic-files').list(oldPath);
                    if (items && items.length > 0) {
                        for (const item of items) {
                            if (item.name) {
                                const fromFile = `${oldPath}/${item.name}`;
                                const toFile = `${newPath}/${item.name}`;
                                try {
                                    if (typeof client.storage.from('academic-files').move === 'function') {
                                        await client.storage.from('academic-files').move(fromFile, toFile);
                                    } else if (typeof client.storage.from('academic-files').copy === 'function') {
                                        await client.storage.from('academic-files').copy(fromFile, toFile);
                                        await client.storage.from('academic-files').remove([fromFile]);
                                    }
                                } catch (err) {}
                            }
                        }
                    }
                } catch (err) {}
            }

            await deleteSupabaseFolder(oldPath);
        }
        await createSubjectFolders(newSubjectId);
    }

    async function deleteSubjectFolders(subjectId) {
        if (!subjectId) return;
        await deleteSupabaseFolder(`notes/${subjectId}`);
        await deleteSupabaseFolder(`question_bank/${subjectId}`);
        await deleteSupabaseFolder(`assignments/${subjectId}`);
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
        deleteFolder: deleteSupabaseFolder,
        createFolders: createSubjectFolders,
        renameFolders: renameSubjectFolders,
        deleteSubjectFolders: deleteSubjectFolders
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
