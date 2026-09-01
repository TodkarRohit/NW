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

    // Admin Authentication Management
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const loginModalBackdrop = document.getElementById('adminLoginModalBackdrop');
    const closeLoginModalBtn = document.getElementById('closeAdminLoginModalBtn');
    const cancelLoginBtn = document.getElementById('cancelAdminLoginBtn');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginErrorMsg = document.getElementById('loginErrorMsg');

    let isAdminLoggedIn = localStorage.getItem('isAdminMode') === 'true';

    function updateAdminStateUI() {
        if (!adminToggleBtn) return;
        if (isAdminLoggedIn) {
            adminToggleBtn.classList.add('active');
            adminToggleBtn.innerHTML = '<i class="fa-solid fa-user-check"></i> <span id="adminBtnText" class="hide-on-mobile">Login Active (Logout)</span>';
        } else {
            adminToggleBtn.classList.remove('active');
            adminToggleBtn.innerHTML = '<i class="fa-solid fa-user-shield"></i> <span id="adminBtnText" class="hide-on-mobile">Login Mode</span>';
        }
    }

    if (adminToggleBtn) {
        adminToggleBtn.addEventListener('click', () => {
            if (isAdminLoggedIn) {
                // Logout Admin
                isAdminLoggedIn = false;
                localStorage.setItem('isAdminMode', 'false');
                updateAdminStateUI();
                showToast('Logged out from Login Mode.');
            } else {
                // Open Login Modal
                if (loginModalBackdrop) {
                    loginModalBackdrop.classList.add('active');
                    if (loginErrorMsg) loginErrorMsg.style.display = 'none';
                }
            }
        });
    }

    function closeLoginModal() {
        if (loginModalBackdrop) loginModalBackdrop.classList.remove('active');
        if (adminLoginForm) adminLoginForm.reset();
        if (loginErrorMsg) loginErrorMsg.style.display = 'none';
    }

    if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', closeLoginModal);
    if (cancelLoginBtn) cancelLoginBtn.addEventListener('click', closeLoginModal);
    if (loginModalBackdrop) {
        loginModalBackdrop.addEventListener('click', (e) => {
            if (e.target === loginModalBackdrop) closeLoginModal();
        });
    }

    let isSignUpMode = false;
    const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn');
    const nameFormGroup = document.getElementById('nameFormGroup');
    const loginModeHint = document.getElementById('loginModeHint');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const loginErrorText = document.getElementById('loginErrorText');
    const adminNameInput = document.getElementById('adminNameInput');

    if (toggleAuthModeBtn) {
        toggleAuthModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;
            if (isSignUpMode) {
                nameFormGroup.style.display = 'block';
                if(adminNameInput) adminNameInput.required = true;
                if(loginModeHint) loginModeHint.textContent = 'Create a new account.';
                if(submitLoginBtn) submitLoginBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Sign Up';
                toggleAuthModeBtn.textContent = 'Already have an account? Login';
            } else {
                nameFormGroup.style.display = 'none';
                if(adminNameInput) adminNameInput.required = false;
                if(loginModeHint) loginModeHint.textContent = 'Enter your credentials to login.';
                if(submitLoginBtn) submitLoginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login';
                toggleAuthModeBtn.textContent = "Don't have an account? Sign Up";
            }
            if (loginErrorMsg) loginErrorMsg.style.display = 'none';
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userVal = document.getElementById('adminUsernameInput').value.trim();
            const passVal = document.getElementById('adminPasswordInput').value;
            const nameVal = adminNameInput ? adminNameInput.value.trim() : '';

            let users = JSON.parse(localStorage.getItem('users') || '[]');

            if (isSignUpMode) {
                if (users.find(u => u.username === userVal)) {
                    if (loginErrorMsg) {
                        if(loginErrorText) loginErrorText.textContent = 'Username already exists!';
                        loginErrorMsg.style.display = 'flex';
                    }
                    return;
                }
                users.push({ username: userVal, password: passVal, name: nameVal });
                localStorage.setItem('users', JSON.stringify(users));
                
                isAdminLoggedIn = true;
                localStorage.setItem('isAdminMode', 'true');
                updateAdminStateUI();
                closeLoginModal();
                showToast(`Welcome ${nameVal || userVal}! Account created successfully.`);
            } else {
                const foundUser = users.find(u => u.username === userVal && u.password === passVal);
                if (foundUser || ((userVal === 'admin' && passVal === 'admin123') || (userVal === 'admin' && passVal === 'admin'))) {
                    isAdminLoggedIn = true;
                    localStorage.setItem('isAdminMode', 'true');
                    updateAdminStateUI();
                    closeLoginModal();
                    showToast(`Welcome back ${foundUser ? foundUser.name || foundUser.username : 'Admin'}!`);
                } else {
                    if (loginErrorMsg) {
                        if(loginErrorText) loginErrorText.textContent = 'Invalid username or password!';
                        loginErrorMsg.style.display = 'flex';
                    }
                }
            }
        });
    }

    updateAdminStateUI();

    // Theme System Management
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const currentTheme = localStorage.getItem('theme') || 'light';

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun" style="color:#facc15"></i> <span class="theme-btn-text hide-on-mobile">Light Mode</span>';
            }
        } else {
            document.body.removeAttribute('data-theme');
            document.documentElement.removeAttribute('data-theme');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon" style="color:#38bdf8"></i> <span class="theme-btn-text hide-on-mobile">Dark Mode</span>';
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
        let baseCount = parseInt(sessionStorage.getItem('online_users_count')) || Math.floor(Math.random() * 12) + 16;
        sessionStorage.setItem('online_users_count', baseCount);
        onlineUsersCountEl.textContent = baseCount;

        setInterval(() => {
            const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
            baseCount = Math.max(12, Math.min(36, baseCount + delta));
            sessionStorage.setItem('online_users_count', baseCount);
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
});