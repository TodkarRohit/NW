
document.addEventListener('DOMContentLoaded', () => {
    // Inject Modal HTML if it doesn't exist
    if (!document.getElementById('adminLoginModalBackdrop')) {
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = `<!-- Auth / Admin Login & Register Modal -->
    <div class="admin-login-backdrop" id="adminLoginModalBackdrop">
        <div class="admin-login-card custom-login-design">
            <button class="close-modal-btn custom-close-btn" id="closeAdminLoginModalBtn"><i class="fa-solid fa-xmark"></i></button>
            <div class="custom-login-header">
                <div class="custom-user-icon">
                    <i class="fa-regular fa-user"></i>
                </div>
                <h2 id="authModalTitle">STUDENT LOGIN</h2>
            </div>
            
            <div style="padding: 1.25rem 1.5rem 0 1.5rem;">
                <div class="auth-mode-tabs" role="tablist">
                    <button type="button" class="auth-tab-btn active" id="tabModeLoginBtn" role="tab">
                        <i class="fa-solid fa-right-to-bracket"></i> Login
                    </button>
                    <button type="button" class="auth-tab-btn" id="tabModeRegisterBtn" role="tab">
                        <i class="fa-solid fa-user-plus"></i> Register
                    </button>
                </div>
            </div>

            <form id="adminLoginForm" class="login-modal-body custom-login-body">
                <p class="login-hint" id="authModeHint" style="font-size: 0.85rem; color: #fff; margin-bottom: 1rem; text-align: center;">Enter your credentials to access study resources and upload privileges. Browsing is always free and open without logging in.</p>
                
                <div class="form-group custom-form-group" id="nameFormGroup" style="display:none;">
                    <i class="fa-solid fa-id-card"></i>
                    <input type="text" id="adminNameInput" placeholder="Full Name" autocomplete="name">
                </div>

                <div class="form-group custom-form-group" id="emailFormGroup">
                    <i class="fa-regular fa-envelope"></i>
                    <input type="email" id="adminEmailInput" placeholder="Email Address (Optional if Username is provided)" autocomplete="email">
                </div>

                <div class="form-group custom-form-group">
                    <i class="fa-solid fa-user-tag"></i>
                    <input type="text" id="adminUsernameInput" placeholder="Username (Optional if Email is provided)" autocomplete="username" maxlength="20">
                </div>
                <div class="auth-hint">
                    <span id="usernameRuleText"></span>
                </div>
                <div id="usernameSuggestionsContainer" class="username-suggestions"></div>

                <div class="form-group custom-form-group" id="branchFormGroup" style="display:none;">
                    <i class="fa-solid fa-code-branch"></i>
                    <select id="userBranchSelect" class="custom-select">
                        <option value="CE">Computer Engineering (CE)</option>
                        <option value="CSE">Computer Science (CSE)</option>
                        <option value="IT">Information Technology (IT)</option>
                        <option value="ECE">Electronics (ECE)</option>
                        <option value="AIDS">AI & DS</option>
                    </select>
                </div>

                <div class="form-group custom-form-group">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" id="adminPasswordInput" placeholder="Enter password (min. 6 characters)" required autocomplete="current-password">
                </div>

                <div class="custom-login-options">
                    <label class="custom-checkbox-label">
                        <input type="checkbox" id="rememberMeCheckbox">
                        <span class="custom-checkmark"></span>
                        Remember me
                    </label>
                    <a href="#" class="custom-forgot-link">Forgot Password?</a>
                </div>

                <div id="loginErrorMsg" class="login-error-msg custom-error" style="display:none;">
                    <i class="fa-solid fa-circle-exclamation"></i> <span id="loginErrorText">Invalid username or password!</span>
                </div>
                
                <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                    <button type="button" class="cancel-btn custom-submit-btn" id="cancelAdminLoginBtn" style="background: rgba(255,255,255,0.2); flex: 1;">Cancel</button>
                    <button type="submit" class="submit-login-btn custom-submit-btn auth-submit-btn" id="authSubmitBtn" style="flex: 1;">
                        <span id="authSubmitBtnText">LOGIN</span>
                    </button>
                </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Toast Notification -->
    
`;
        document.body.appendChild(modalContainer.firstElementChild);
    }

    // Initialize modal logic
    setTimeout(() => {
        let adminToggleBtn = document.getElementById('adminToggleBtn');
    // if not found, we will delegate click on body

    const loginModalBackdrop = document.getElementById('adminLoginModalBackdrop');
    const closeLoginModalBtn = document.getElementById('closeAdminLoginModalBtn');
    const cancelLoginBtn = document.getElementById('cancelAdminLoginBtn');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginErrorMsg = document.getElementById('loginErrorMsg');
    const loginErrorText = document.getElementById('loginErrorText');
    const usernameInput = document.getElementById('adminUsernameInput');
    const passwordInput = document.getElementById('adminPasswordInput');
    const usernameCharBadge = document.getElementById('usernameCharBadge');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authSubmitBtnText = document.getElementById('authSubmitBtnText');
    const authModeHint = document.getElementById('authModeHint');
    const tabModeLoginBtn = document.getElementById('tabModeLoginBtn');
    const tabModeRegisterBtn = document.getElementById('tabModeRegisterBtn');

    let currentAuthMode = 'login'; // 'login' | 'register'

    function setAuthMode(mode) {
        currentAuthMode = mode;
        if (loginErrorMsg) loginErrorMsg.style.display = 'none';
        const branchFormGroup = document.getElementById('branchFormGroup');
        const emailFormGroup = document.getElementById('emailFormGroup');
        const nameFormGroup = document.getElementById('nameFormGroup');

        if (mode === 'register') {
            if (tabModeRegisterBtn) tabModeRegisterBtn.classList.add('active');
            if (tabModeLoginBtn) tabModeLoginBtn.classList.remove('active');
            if (authSubmitBtnText) authSubmitBtnText.textContent = 'Create Account';
            if (authModeHint) authModeHint.textContent = 'Create a new account.';
            if (nameFormGroup) nameFormGroup.style.display = 'flex';
            if (emailFormGroup) emailFormGroup.style.display = 'flex';
            if (branchFormGroup) branchFormGroup.style.display = 'flex';
        } else {
            if (tabModeLoginBtn) tabModeLoginBtn.classList.add('active');
            if (tabModeRegisterBtn) tabModeRegisterBtn.classList.remove('active');
            if (authSubmitBtnText) authSubmitBtnText.textContent = 'Login';
            if (authModeHint) authModeHint.textContent = 'Enter your credentials to access study resources and upload privileges.';
            if (nameFormGroup) nameFormGroup.style.display = 'none';
            // email visible on login
            if (branchFormGroup) branchFormGroup.style.display = 'none';
        }
        updateCharBadge();
    }

    if (tabModeLoginBtn) tabModeLoginBtn.addEventListener('click', () => setAuthMode('login'));
    if (tabModeRegisterBtn) tabModeRegisterBtn.addEventListener('click', () => setAuthMode('register'));

    function updateCharBadge() {
        if (!usernameInput || !usernameCharBadge) return;
        const len = usernameInput.value.length;
        usernameCharBadge.textContent = `${len}/8`;
        if (len === 8) {
            usernameCharBadge.className = 'char-counter-badge valid';
        } else if (len > 0) {
            usernameCharBadge.className = 'char-counter-badge invalid';
        } else {
            usernameCharBadge.className = 'char-counter-badge';
        }
    }

    if (usernameInput) {
        usernameInput.addEventListener('input', updateCharBadge);
    }

    function openLoginModal() {
        if (loginModalBackdrop) {
            loginModalBackdrop.classList.add('active');
            if (loginErrorMsg) loginErrorMsg.style.display = 'none';
            setAuthMode('login');
            if (usernameInput) {
                usernameInput.focus();
                updateCharBadge();
            }
        }
    }

    function closeLoginModal() {
        if (loginModalBackdrop) loginModalBackdrop.classList.remove('active');
        if (adminLoginForm) adminLoginForm.reset();
        if (loginErrorMsg) loginErrorMsg.style.display = 'none';
        updateCharBadge();
    }

    
    // Attach listener to all possible toggle buttons (in case of multiple or dynamic)
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#adminToggleBtn')) {
            e.preventDefault();
            if (window.authService && window.authService.isLoggedIn()) {
                window.authService.logout();
            } else {
                openLoginModal();
            }
        }
    });
    // Removed old static listener:
    if (false) {
        adminToggleBtn.addEventListener('click', () => {
            if (window.authService && window.authService.isLoggedIn()) {
                window.authService.logout();
            } else {
                openLoginModal();
            }
        });
    }

    if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', closeLoginModal);
    if (cancelLoginBtn) cancelLoginBtn.addEventListener('click', closeLoginModal);
    if (loginModalBackdrop) {
        loginModalBackdrop.addEventListener('click', (e) => {
            if (e.target === loginModalBackdrop) closeLoginModal();
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('adminNameInput');
            const emailInput = document.getElementById('adminEmailInput');
            const userVal = usernameInput ? usernameInput.value.trim() : '';
            const passVal = passwordInput ? passwordInput.value : '';
            const nameVal = nameInput ? nameInput.value.trim() : '';
            const emailVal = emailInput ? emailInput.value.trim() : '';

            if (loginErrorMsg) loginErrorMsg.style.display = 'none';
            if (authSubmitBtn) {
                authSubmitBtn.disabled = true;
                if (authSubmitBtnText) authSubmitBtnText.textContent = 'Processing...';
            }

            try {
                if (currentAuthMode === 'register') {

                    if (passVal.length < 6) {
                        throw new Error('Password must be at least 6 characters long.');
                    }
                    if (!nameVal) {
                        throw new Error('Please enter your full name.');
                    }
                    const loginId = userVal || emailVal;
                    if (!loginId) {
                        throw new Error('Please enter either your username or email address.');
                    }
                    if (userVal && (userVal.includes('@') || userVal.includes(' '))) {
                        throw new Error('Username must not contain @ or spaces. Please enter a simple handle.');
                    }
                    await window.authService.register(userVal, passVal, nameVal, emailVal);
                    const branchSelect = document.getElementById('userBranchSelect');
                    if (branchSelect) localStorage.setItem('user_branch', branchSelect.value);
                    closeLoginModal();
                    showToast(`Registration successful! Welcome, ${userVal}!`);
                } else {
                    // Try backend login first
                    try {
                        const loginId = userVal || emailVal; await window.authService.login(loginId, passVal);
                        const branchSelect = document.getElementById('userBranchSelect');
                        if (branchSelect) localStorage.setItem('user_branch', branchSelect.value);
                        closeLoginModal();
                        showToast(`Welcome back, ${userVal}!`);
                        setTimeout(() => window.location.reload(), 1000);
                    } catch (apiErr) {
                        // Fallback for offline admin compatibility if default admin credentials used
                        const loginId2 = userVal || emailVal; if ((loginId2 === 'admin' && passVal === 'admin123') || (loginId2 === 'admin' && passVal === 'admin') || (loginId2 === 'rohittodkar92@gmail.com' && passVal === 'Admin@123')) {
                            window.authService.saveSession('offline_admin_token', { id: 'admin_local', username: 'rohittodkar92@gmail.com' });
                            const branchSelect = document.getElementById('userBranchSelect');
                            if (branchSelect) localStorage.setItem('user_branch', branchSelect.value);
                            closeLoginModal();
                            showToast('Logged in as Admin (Local Mode).');
                            setTimeout(() => window.location.reload(), 1000);
                        } else {
                            throw apiErr;
                        }
                    }
                }
            } catch (err) {
                const suggestionContainer = document.getElementById('usernameSuggestionsContainer');
                if (suggestionContainer) suggestionContainer.innerHTML = '';
                
                let errorMsgText = err.message || 'Authentication failed.';
                
                if (errorMsgText.includes('is taken. Try:')) {
                    const parts = errorMsgText.split('Try:');
                    const baseMsg = parts[0].trim();
                    const suggestionsStr = parts[1].trim();
                    const suggestions = suggestionsStr.split(',').map(s => s.trim());
                    
                    errorMsgText = baseMsg;
                    
                    if (suggestionContainer) {
                        suggestionContainer.innerHTML = suggestions.map(s => 
                            `<span class="username-suggestion-pill" onclick="document.getElementById('adminUsernameInput').value = '${s}'; document.getElementById('usernameSuggestionsContainer').innerHTML = '';">${s}</span>`
                        ).join(' ');
                    }
                }
                
                if (loginErrorMsg) {
                    loginErrorMsg.style.display = 'flex';
                    if (loginErrorText) loginErrorText.textContent = errorMsgText;
                }
            } finally {
                if (authSubmitBtn) {
                    authSubmitBtn.disabled = false;
                    if (authSubmitBtnText) authSubmitBtnText.textContent = currentAuthMode === 'register' ? 'Create Account' : 'Login';
                }
            }
        });
    }

    
    }, 50);
});

