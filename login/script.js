// Engineering Notes Hub - Home Page Script

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const searchCounter = document.getElementById('searchCounter');
    const subjectCards = document.querySelectorAll('.subject-card');
    const noResultsMessage = document.getElementById('noResultsMessage');

    const subjectAliases = {
        'dsa': ['dsa', 'data structure', 'algorithm', 'c++', 'cpp', 'stack', 'queue', 'tree', 'graph', 'sorting'],
        'oop': ['oop', 'object oriented', 'programming', 'c++', 'cpp', 'class', 'inheritance', 'polymorphism'],
        'os': ['os', 'operating system', 'deadlock', 'memory', 'thread', 'process', 'paging', 'cpu'],
        'math': ['math', 'mathematics', 'calculus', 'matrix', 'matrices', 'differential', 'fourier'],
        'hardware': ['hardware', 'computer hardware', 'organization', 'architecture', 'cpu', 'bus', 'register']
    };

    function performHomepageSearch(rawQuery) {
        const query = rawQuery.toLowerCase().trim();
        let visibleCount = 0;

        // Toggle clear button
        if (searchClearBtn) {
            searchClearBtn.style.display = query.length > 0 ? 'flex' : 'none';
        }

        subjectCards.forEach(card => {
            const sId = card.getAttribute('data-subject') || '';
            const titleEl = card.querySelector('h2');
            const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
            const semText = card.querySelector('.semester-tag') ? card.querySelector('.semester-tag').textContent.toLowerCase() : '';

            // Check aliases
            const aliases = subjectAliases[sId] || [sId];
            const aliasMatch = query.length > 0 && aliases.some(alias => alias.includes(query) || query.includes(alias));

            // Check topics from subjectsData
            let topicsMatch = false;
            if (typeof subjectsData !== 'undefined' && subjectsData[sId]) {
                const sData = subjectsData[sId];
                if (sData.chapters) {
                    topicsMatch = sData.chapters.some(ch => 
                        (ch.title && ch.title.toLowerCase().includes(query)) ||
                        (ch.name && ch.name.toLowerCase().includes(query))
                    );
                }
                if (!topicsMatch && sData.questionBanks) {
                    topicsMatch = sData.questionBanks.some(qb => 
                        (qb.title && qb.title.toLowerCase().includes(query)) ||
                        (qb.name && qb.name.toLowerCase().includes(query))
                    );
                }
            }

            const isMatch = query === '' || titleText.includes(query) || semText.includes(query) || sId.includes(query) || aliasMatch || topicsMatch;

            if (isMatch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update Counter & No Results State
        if (searchCounter) {
            if (query.length > 0) {
                searchCounter.style.display = 'inline-block';
                searchCounter.innerHTML = `<i class="fa-solid fa-filter"></i> Found <strong>${visibleCount}</strong> matching subject${visibleCount === 1 ? '' : 's'} for "<em>${escapeHTML(query)}</em>"`;
            } else {
                searchCounter.style.display = 'none';
            }
        }

        if (noResultsMessage) {
            noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => performHomepageSearch(e.target.value));

        // Keyboard Shortcut (Ctrl+K or /)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            } else if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                performHomepageSearch('');
                searchInput.blur();
            }
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                performHomepageSearch('');
                searchInput.focus();
            }
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // ---------------------------------------------------------
    // User & Admin Authentication Management
    // ---------------------------------------------------------
    const adminToggleBtn = document.getElementById('adminToggleBtn');
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
            if (emailFormGroup) emailFormGroup.style.display = 'none';
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

    if (adminToggleBtn) {
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
                    if (userVal.includes('@') || userVal.includes(' ')) {
                        throw new Error('Username must not contain @ or spaces. Please enter a simple handle.');
                    }
                    if (!emailVal) {
                        throw new Error('Please enter your email address.');
                    }
                    await window.authService.register(userVal, passVal, nameVal, emailVal);
                    const branchSelect = document.getElementById('userBranchSelect');
                    if (branchSelect) localStorage.setItem('user_branch', branchSelect.value);
                    closeLoginModal();
                    showToast(`Registration successful! Welcome, ${userVal}!`);
                } else {
                    // Try backend login first
                    try {
                        await window.authService.login(userVal, passVal);
                        const branchSelect = document.getElementById('userBranchSelect');
                        if (branchSelect) localStorage.setItem('user_branch', branchSelect.value);
                        closeLoginModal();
                        showToast(`Welcome back, ${userVal}!`);
                    } catch (apiErr) {
                        // Fallback for offline admin compatibility if default admin credentials used
                        if ((userVal === 'admin' && passVal === 'admin123') || (userVal === 'admin' && passVal === 'admin')) {
                            window.authService.saveSession('offline_admin_token', { id: 'admin_local', username: 'admin' });
                            const branchSelect = document.getElementById('userBranchSelect');
                            if (branchSelect) localStorage.setItem('user_branch', branchSelect.value);
                            closeLoginModal();
                            showToast('Logged in as Admin (Local Mode).');
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

    // Theme System Management
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const currentTheme = localStorage.getItem('theme') || 'light';

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun" style="color:#facc15"></i> <span class="theme-btn-text">Light Mode</span>';
            }
        } else {
            document.body.removeAttribute('data-theme');
            document.documentElement.removeAttribute('data-theme');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon" style="color:#38bdf8"></i> <span class="theme-btn-text">Dark Mode</span>';
            }
        }
    }

    applyTheme(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const activeTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', activeTheme);
            applyTheme(activeTheme);
        });
    }

    // Live Online Users Counter Simulation
    const onlineUsersCountEl = document.getElementById('onlineUsersCount');
    if (onlineUsersCountEl) {
        let baseCount = parseInt(localStorage.getItem('online_users_count')) || Math.floor(Math.random() * 20) + 142; // Random between 142 and 162
        localStorage.setItem('online_users_count', baseCount);
        onlineUsersCountEl.textContent = baseCount;

        setInterval(() => {
            const delta = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, +1, +2
            baseCount = Math.max(125, Math.min(185, baseCount + delta));
            localStorage.setItem('online_users_count', baseCount);
            onlineUsersCountEl.textContent = baseCount;
        }, 5000);
    }

    // Helper: Toast Notification
    function showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Home Sidebar Toggle
    const homeSidebarToggle = document.getElementById('homeSidebarToggle');
    const homeSidebar = document.getElementById('homeSidebar');
    
    if (homeSidebarToggle && homeSidebar) {
        homeSidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            homeSidebar.classList.toggle('active'); // For mobile
            homeSidebar.classList.toggle('collapsed'); // For desktop
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900 && homeSidebar.classList.contains('active')) {
                if (!homeSidebar.contains(e.target) && e.target !== homeSidebarToggle) {
                    homeSidebar.classList.remove('active');
                    homeSidebar.classList.add('collapsed'); // ensure desktop sync
                }
            }
        });
    }

    // Branch Selection Logic
    const branchItems = document.querySelectorAll('.branch-item');
    const subjectsContainer = document.getElementById('subjectsContainer');
    const branchUnavailableMessage = document.getElementById('branchUnavailableMessage');
    const searchSection = document.querySelector('.search-section');

    function updateBranchDisplay(branchName) {
        if (branchName === 'CE') {
            if (subjectsContainer) subjectsContainer.style.display = 'grid'; // or 'flex' depending on CSS
            if (searchSection) searchSection.style.display = 'block';
            if (branchUnavailableMessage) branchUnavailableMessage.style.display = 'none';
        } else {
            if (subjectsContainer) subjectsContainer.style.display = 'none';
            if (searchSection) searchSection.style.display = 'none';
            if (branchUnavailableMessage) branchUnavailableMessage.style.display = 'block';
            
            // Also hide "no results" message from search if it was visible
            const noResMsg = document.getElementById('noResultsMessage');
            if (noResMsg) noResMsg.style.display = 'none';
        }
    }

    if (branchItems.length > 0) {
        // Initialize from localStorage if available
        const savedBranch = localStorage.getItem('user_branch');
        if (savedBranch && window.authService && window.authService.isLoggedIn()) {
            branchItems.forEach(item => {
                if (item.dataset.branch === savedBranch) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            updateBranchDisplay(savedBranch);
        }

        // Add click listener
        branchItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                branchItems.forEach(b => b.classList.remove('active'));
                item.classList.add('active');
                const branchName = item.dataset.branch;
                
                showToast(`Switched to ${item.textContent.trim()} Branch`);
                updateBranchDisplay(branchName);
                
                // Save selection if logged in
                if (window.authService && window.authService.isLoggedIn()) {
                    localStorage.setItem('user_branch', branchName);
                }
            });
        });
    }
});


