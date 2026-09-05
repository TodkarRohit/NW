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

    const authService = {
        API_BASE_URL,

        getToken() {
            return localStorage.getItem(TOKEN_KEY);
        },

        getUser() {
            try {
                const userJson = localStorage.getItem(USER_KEY);
                return userJson ? JSON.parse(userJson) : null;
            } catch {
                return null;
            }
        },

        isLoggedIn() {
            return !!this.getToken();
        },

        saveSession(token, user) {
            if (token) localStorage.setItem(TOKEN_KEY, token);
            if (user) {
                localStorage.setItem(USER_KEY, JSON.stringify(user));
                const isAdmin = 
                    user.is_admin === true || 
                    user.is_admin === 'true' || 
                    user.role === 'admin' || 
                    String(user.role || '').toLowerCase() === 'admin' ||
                    user.username === 'admin' || 
                    user.email === 'rohittodkar92S@gmail.com' || 
                    user.email === 'rohittodkar92@gmail.com' || 
                    user.username === 'rohittodkar92S@gmail.com' ||
                    user.username === 'rohittodkar92@gmail.com';

                if (isAdmin) {
                    localStorage.setItem('isAdminMode', 'true');
                } else {
                    localStorage.setItem('isAdminMode', 'false');
                }
            }
            this.updateHeaderUI();
        },

        clearSession() {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.setItem('isAdminMode', 'false');
            this.updateHeaderUI();
        },

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
                    // If token expired / unauthorized, handle session expiry
                    if (response.status === 401 && token) {
                        this.clearSession();
                    }

                    // Format user-friendly error messages based on status and response
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
                // Catch fetch/network connection failures
                if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
                    throw new Error('Server unavailable: Unable to reach backend on http://localhost:5000. Please ensure the server is running.');
                }
                throw err;
            }
        },

        /**
         * 1. Register a new user: POST /api/auth/register
         * Enforces strict 8-character username rule
         */
        async hashPassword(password) {
            const msgBuffer = new TextEncoder().encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        },

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
                    // Postgres unique constraint violation
                    // Generate 3 random suggestions
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
        },

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
        },

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
        },

        /**
         * 4. Get registered users list (Protected): GET /api/users
         */
        async getUsers() {
            return await this.authFetch('/users', { method: 'GET' });
        },

        /**
         * 5. Get public study resources (Public): GET /api/resources
         */
        async getResources(subject = '', type = '') {
            const params = new URLSearchParams();
            if (subject) params.append('subject', subject);
            if (type) params.append('type', type);
            const query = params.toString() ? `?${params.toString()}` : '';
            return await this.authFetch(`/resources${query}`, { method: 'GET' });
        },

        /**
         * Update the UI header across all pages
         */
        updateHeaderUI() {
            const user = this.getUser();
            const token = this.getToken();
            const adminToggleBtn = document.getElementById('adminToggleBtn');

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
        },

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
    };

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Expose authService globally
    window.authService = authService;

    // Initialize once DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        authService.updateHeaderUI();
    });
})();



