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
    const API_BASE_URL = 'http://localhost:5000/api';
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
                // Set legacy flag for existing admin compatibility
                if (user.username === 'admin' || user.username) {
                    localStorage.setItem('isAdminMode', 'true');
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
        async register(username, password) {
            const cleanUser = String(username || '').trim();
            if (!cleanUser) {
                throw new Error('Username is required.');
            }
            if (cleanUser.length !== 8) {
                throw new Error(`Invalid username: Username must be exactly 8 characters long (currently ${cleanUser.length} chars).`);
            }
            if (!password || password.length < 6) {
                throw new Error('Invalid password: Password must be at least 6 characters long.');
            }

            const data = await this.authFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username: cleanUser, password })
            });

            if (data.token && data.user) {
                this.saveSession(data.token, data.user);
            }

            return data;
        },

        /**
         * 2. Login user: POST /api/auth/login
         */
        async login(username, password) {
            const cleanUser = String(username || '').trim();
            if (!cleanUser) {
                throw new Error('Please enter your username.');
            }
            if (!password) {
                throw new Error('Please enter your password.');
            }

            const data = await this.authFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username: cleanUser, password })
            });

            if (data.token && data.user) {
                this.saveSession(data.token, data.user);
            }

            return data;
        },

        /**
         * 3. Logout user: POST /api/auth/logout
         */
        async logout() {
            try {
                if (this.getToken()) {
                    await this.authFetch('/auth/logout', { method: 'POST' });
                }
            } catch (err) {
                console.warn('Logout notification notice:', err.message);
            } finally {
                this.clearSession();
                this.showToast('You have been logged out successfully.');
            }
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
