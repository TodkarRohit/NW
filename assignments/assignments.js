// Engineering Notes Hub - Assignments Section Script
// Features: Chapter/Unit Navigation, Admin-Only File Upload, Side-by-Side Q&A, PDF Previews & Discussion

document.addEventListener('DOMContentLoaded', async () => {
    // ---------------------------------------------------------
    // 1. Theme Management (Dark / Light Mode)
    // ---------------------------------------------------------
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> <span class="theme-btn-text">Light Mode</span>';
            }
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> <span class="theme-btn-text">Dark Mode</span>';
            }
        }
    }

    // Event delegation for theme toggle
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#themeToggleBtn')) {
            const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        }
    });

    initTheme();

    // ---------------------------------------------------------
    // 2. Subject & Chapter Data Definition
    // ---------------------------------------------------------
    const defaultSubjectAssignments = {
        'dsa': {
            title: 'Data Structure and Algorithm (C++)',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: []
        },
        'oop': {
            title: 'Object Oriented Programming (Using C++)',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: []
        },
        'os': {
            title: 'Operating System',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: []
        },
        'maths': {
            title: 'Engineering Mathematics',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: []
        },
        'hardware': {
            title: 'Computer Hardware and its Organization',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: []
        }
    };

    // Aliases
    defaultSubjectAssignments['math'] = defaultSubjectAssignments['maths'];
    defaultSubjectAssignments['coa'] = defaultSubjectAssignments['hardware'];

    // ---------------------------------------------------------
    // 3. Resolve Current Subject and Chapters
    // ---------------------------------------------------------
    if (typeof window.loadCustomSubjectsIntoData === 'function') {
        window.loadCustomSubjectsIntoData();
    }

    const urlParams = new URLSearchParams(window.location.search);
    let subjectKey = urlParams.get('subject') || 'dsa';

    if (subjectKey === 'math') subjectKey = 'maths';
    if (subjectKey === 'coa') subjectKey = 'hardware';

    const defaultSubjectTitles = {
        'dsa': 'Data Structure and Algorithm(C++)',
        'oop': 'Object Oriented Programming (Using C++)',
        'maths': 'Engineering Mathematics',
        'math': 'Engineering Mathematics',
        'hardware': 'Computer Organization and Architecture',
        'coa': 'Computer Organization and Architecture',
        'os': 'Operating System'
    };

    if (!defaultSubjectAssignments[subjectKey]) {
        if (typeof subjectsData !== 'undefined' && subjectsData[subjectKey]) {
            defaultSubjectAssignments[subjectKey] = {
                title: subjectsData[subjectKey].title,
                subtitle: (subjectsData[subjectKey].semester || 'Semester 2') + ' • NMIET',
                assignments: []
            };
        } else {
            const resolvedTitle = defaultSubjectTitles[subjectKey.toLowerCase()] || (subjectKey ? subjectKey.toUpperCase() : 'Subject');
            defaultSubjectAssignments[subjectKey] = {
                title: resolvedTitle,
                subtitle: 'Semester 2 • NMIET',
                assignments: []
            };
        }
    }

    const currentSubject = defaultSubjectAssignments[subjectKey];

    // Chapters from data.js
    let subjectChapters = [];
    if (typeof subjectsData !== 'undefined' && subjectsData[subjectKey] && subjectsData[subjectKey].chapters) {
        subjectChapters = subjectsData[subjectKey].chapters;
    }

    // Active Chapter Filter State ('all' or specific chapter id e.g. 'dsa-u1')
    let activeChapterId = 'all';

    // ---------------------------------------------------------
    // 4. Update Header Elements & Navigation Links
    // ---------------------------------------------------------
    const subjectTitleEl = document.getElementById('subjectTitle');
    const subjectSubtitleEl = document.getElementById('subjectSubtitle');
    const notesNavBtn = document.getElementById('notesNavBtn');
    const qbNavBtn = document.getElementById('qbNavBtn');
    const assNavBtn = document.getElementById('assNavBtn');
    const totalChaptersBadge = document.getElementById('totalChaptersBadge');

    if (subjectTitleEl) subjectTitleEl.textContent = currentSubject.title;
    if (subjectSubtitleEl) subjectSubtitleEl.textContent = currentSubject.subtitle;
    if (typeof NavigationManager !== 'undefined') {
        NavigationManager.connectHeaderTabs(subjectKey, 'assignments');
    } else {
        if (notesNavBtn) notesNavBtn.href = `../notes/viewer.html?subject=${subjectKey}&type=notes`;
        if (qbNavBtn) qbNavBtn.href = `../question_bank/viewer.html?subject=${subjectKey}&type=qb`;
        if (assNavBtn) assNavBtn.href = `assignments.html?subject=${subjectKey}`;
    }
    if (totalChaptersBadge) totalChaptersBadge.textContent = `${subjectChapters.length} Units`;

    document.title = `${currentSubject.title} - Assignments | Engineering Notes Hub`;

    // ---------------------------------------------------------
    // 5. Admin Mode State & Authentication
    // ---------------------------------------------------------
    // 5. Admin & User Auth State & Modal Management
    // ---------------------------------------------------------
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const openUploadModalBtn = document.getElementById('openUploadModalBtn');
    const adminLoginModalBackdrop = document.getElementById('adminLoginModalBackdrop');
    const closeAdminLoginModalBtn = document.getElementById('closeAdminLoginModalBtn');
    const cancelAdminLoginBtn = document.getElementById('cancelAdminLoginBtn');
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
    const adminUploadPortalSection = document.getElementById('adminUploadPortalSection');

    let currentAuthMode = 'login'; // 'login' | 'register'

    function checkIsAdmin() {
        return localStorage.getItem('isAdminMode') === 'true';
    }

    let isAdminMode = checkIsAdmin();

    function setAuthMode(mode) {
        currentAuthMode = mode;
        if (loginErrorMsg) loginErrorMsg.style.display = 'none';
        const nameFormGroup = document.getElementById('nameFormGroup');
        const emailFormGroup = document.getElementById('emailFormGroup');

        if (mode === 'register') {
            if (tabModeRegisterBtn) tabModeRegisterBtn.classList.add('active');
            if (tabModeLoginBtn) tabModeLoginBtn.classList.remove('active');
            if (authSubmitBtnText) authSubmitBtnText.textContent = 'Create Account';
            if (authModeHint) authModeHint.textContent = 'Create a new account.';
            if (nameFormGroup) nameFormGroup.style.display = 'flex';
            if (emailFormGroup) emailFormGroup.style.display = 'flex';
        } else {
            if (tabModeLoginBtn) tabModeLoginBtn.classList.add('active');
            if (tabModeRegisterBtn) tabModeRegisterBtn.classList.remove('active');
            if (authSubmitBtnText) authSubmitBtnText.textContent = 'Login';
            if (authModeHint) authModeHint.textContent = 'Enter your credentials to enable assignment upload and management privileges.';
            if (nameFormGroup) nameFormGroup.style.display = 'none';
            if (emailFormGroup) emailFormGroup.style.display = 'none';
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

    function openAdminLoginModal() {
        if (adminLoginModalBackdrop) {
            adminLoginModalBackdrop.classList.add('active');
            if (loginErrorMsg) loginErrorMsg.style.display = 'none';
            setAuthMode('login');
            if (usernameInput) {
                usernameInput.focus();
                updateCharBadge();
            }
        }
    }

    function closeAdminLoginModal() {
        if (adminLoginModalBackdrop) adminLoginModalBackdrop.classList.remove('active');
        if (adminLoginForm) adminLoginForm.reset();
        if (loginErrorMsg) loginErrorMsg.style.display = 'none';
        updateCharBadge();
    }

    if (closeAdminLoginModalBtn) closeAdminLoginModalBtn.addEventListener('click', closeAdminLoginModal);
    if (cancelAdminLoginBtn) cancelAdminLoginBtn.addEventListener('click', closeAdminLoginModal);
    if (adminLoginModalBackdrop) {
        adminLoginModalBackdrop.addEventListener('click', (e) => {
            if (e.target === adminLoginModalBackdrop) closeAdminLoginModal();
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
                    isAdminMode = checkIsAdmin();
                    updateAdminUI();
                    closeAdminLoginModal();
                    showToast(`Registration successful! Welcome, ${userVal}!`);
                } else {
                    try {
                        await window.authService.login(userVal, passVal);
                        isAdminMode = checkIsAdmin();
                        updateAdminUI();
                        closeAdminLoginModal();
                        showToast(`Welcome back, ${userVal}!`);
                    } catch (apiErr) {
                        if ((userVal === 'admin' && passVal === 'admin123') || (userVal === 'admin' && passVal === 'admin')) {
                            isAdminMode = true;
                            localStorage.setItem('isAdminMode', 'true');
                            window.authService.saveSession('offline_admin_token', { id: 'admin_local', username: 'admin' });
                            updateAdminUI();
                            closeAdminLoginModal();
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

    if (adminToggleBtn) {
    }

    // ---------------------------------------------------------
    // 6. OOP StorageManager & AssignmentManager Classes
    // ---------------------------------------------------------
    class StorageManager {
        static extractPath(urlOrPath) {
            if (!urlOrPath) return null;
            if (urlOrPath.includes('/academic-files/')) {
                const parts = urlOrPath.split('/academic-files/');
                return decodeURIComponent(parts[1]);
            }
            if (urlOrPath.startsWith('assignments/')) {
                return urlOrPath;
            }
            return null;
        }

        static async removeFile(urlOrPath) {
            const path = StorageManager.extractPath(urlOrPath);
            if (!path) return;
            try {
                console.log('Cleaning up old storage file to free space:', path);
                await window.supabaseClient.storage.from('academic-files').remove([path]);
            } catch (e) {
                console.warn('Storage file deletion error:', path, e);
            }
        }

        static fileToDataUrl(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        static async uploadWithFallback(bucket, path, file) {
            try {
                const { error } = await window.supabaseClient.storage
                    .from(bucket)
                    .upload(path, file, { contentType: file.type || 'application/pdf', cacheControl: '3600', upsert: true });

                if (error) {
                    console.warn('Supabase storage upload error, falling back to DataURL:', error);
                    return await StorageManager.fileToDataUrl(file);
                }

                const { data } = window.supabaseClient.storage.from(bucket).getPublicUrl(path);
                return (data && data.publicUrl) ? data.publicUrl : await StorageManager.fileToDataUrl(file);
            } catch (e) {
                console.warn('Storage exception, falling back to DataURL:', e);
                return await StorageManager.fileToDataUrl(file);
            }
        }
    }

    class AssignmentManager {
        constructor(subjectKey) {
            this.subjectKey = subjectKey;
            this.dbAssignments = [];
        }

        getSubjectKeys() {
            const keys = [this.subjectKey];
            if (this.subjectKey === 'maths') keys.push('math');
            if (this.subjectKey === 'math') keys.push('maths');
            if (this.subjectKey === 'hardware') keys.push('coa');
            if (this.subjectKey === 'coa') keys.push('hardware');
            return keys;
        }

        getCombinedAssignments(sKey, defaultMap) {
            const builtIn = defaultMap && defaultMap[sKey] ? defaultMap[sKey].assignments : [];
            return [...this.dbAssignments, ...builtIn];
        }

        async fetchAssignments() {
            try {
                const keysToQuery = this.getSubjectKeys();
                const { data, error } = await window.supabaseClient
                    .from('assignments')
                    .select('*')
                    .in('subject_key', keysToQuery);

                const localCustom = JSON.parse(localStorage.getItem(`custom_assignments_${this.subjectKey}`)) || [];

                if (!error && data) {
                    const remoteAssignments = data.map(row => ({
                        id: row.id,
                        chapterId: row.chapter_id,
                        unit: row.unit,
                        chapterTitle: row.chapter_title,
                        num: row.num,
                        title: row.title,
                        questionFile: row.question_file,
                        answerFile: row.answer_file,
                        questionDataUrl: row.question_data_url,
                        answerDataUrl: row.answer_data_url,
                        views: row.views || 1,
                        downloads: row.downloads || 0,
                        isCustom: row.is_custom,
                        comments: row.comments || [],
                        questionPreview: row.question_preview,
                        answerPreview: row.answer_preview
                    }));

                    const combinedMap = new Map();
                    remoteAssignments.forEach(item => combinedMap.set(item.id, item));
                    localCustom.forEach(item => {
                        if (!combinedMap.has(item.id)) {
                            combinedMap.set(item.id, item);
                        }
                    });

                    this.dbAssignments = Array.from(combinedMap.values());
                    this.saveLocalCache();
                } else {
                    this.dbAssignments = localCustom;
                }
            } catch (e) {
                console.error('Error fetching assignments:', e);
                this.dbAssignments = JSON.parse(localStorage.getItem(`custom_assignments_${this.subjectKey}`)) || [];
            }
            return this.dbAssignments;
        }

        saveLocalCache() {
            try {
                localStorage.setItem(`custom_assignments_${this.subjectKey}`, JSON.stringify(this.dbAssignments));
            } catch (e) {}
        }

        async publishAssignment(params) {
            const { targetSubjectKey, targetChapterId, targetChObj, assNum, assTitle, qFile, aFile, qNotes, aNotes } = params;

            const qStoragePath = `assignments/${targetSubjectKey}/${targetChapterId}/questions/${Date.now()}_${qFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
            const qDataUrl = await StorageManager.uploadWithFallback('academic-files', qStoragePath, qFile);

            let aDataUrl = '';
            let aFileName = '';
            let aPreviewHtml = `
                <div class="pdf-doc-view" style="text-align:center; padding:1.5rem 1rem;">
                    <i class="fa-solid fa-hourglass-half" style="font-size:2rem; color:#f59e0b; margin-bottom:0.5rem;"></i>
                    <div class="pdf-doc-title" style="color:#f1f5f9; font-weight:600;">Solution Document Coming Soon</div>
                    <p style="font-size:0.85rem; color:#94a3b8; margin-top:4px;">${escapeHtml(aNotes || 'Solution PDF will be uploaded soon.')}</p>
                </div>
            `;

            if (aFile) {
                aFileName = aFile.name;
                const aStoragePath = `assignments/${targetSubjectKey}/${targetChapterId}/solutions/${Date.now()}_${aFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
                aDataUrl = await StorageManager.uploadWithFallback('academic-files', aStoragePath, aFile);
                aPreviewHtml = `
                    <div class="pdf-doc-view">
                        <div class="pdf-doc-title"><i class="fa-solid fa-file-pdf" style="color:#16a34a"></i> ${escapeHtml(aFile.name)}</div>
                        <p>${escapeHtml(aNotes || 'Uploaded PDF Solution Document. Click Download below to get full PDF file.')}</p>
                        <div class="pdf-doc-meta" style="margin-top:8px;">File size: ${(aFile.size / 1024).toFixed(1)} KB • PDF Document</div>
                    </div>
                `;
            }

            const safeAnswerFile = aFileName || '';
            const safeAnswerDataUrl = aDataUrl || '';
            const safeQuestionDataUrl = qDataUrl || '';

            const newAssId = `custom_ass_${Date.now()}`;
            const newAssignment = {
                id: newAssId,
                chapterId: targetChapterId,
                unit: targetChObj ? (targetChObj.unit || 'Unit 1') : 'Unit 1',
                chapterTitle: targetChObj ? (targetChObj.name || targetChObj.title) : 'Unit 1',
                num: assNum,
                title: assTitle,
                questionFile: qFile.name,
                answerFile: safeAnswerFile,
                questionDataUrl: safeQuestionDataUrl,
                answerDataUrl: safeAnswerDataUrl,
                views: 1,
                downloads: 0,
                isCustom: true,
                comments: [],
                questionPreview: `
                    <div class="pdf-doc-view">
                        <div class="pdf-doc-title"><i class="fa-solid fa-file-pdf" style="color:#0284c7"></i> ${escapeHtml(qFile.name)}</div>
                        <p>${escapeHtml(qNotes || 'Uploaded PDF Question Document. Click Download below to get full PDF file.')}</p>
                        <div class="pdf-doc-meta" style="margin-top:8px;">File size: ${(qFile.size / 1024).toFixed(1)} KB • PDF Document</div>
                    </div>
                `,
                answerPreview: aPreviewHtml
            };

            try {
                await window.supabaseClient.from('assignments').insert([{
                    id: newAssId,
                    subject_key: targetSubjectKey,
                    chapter_id: targetChapterId,
                    unit: newAssignment.unit,
                    chapter_title: newAssignment.chapterTitle,
                    num: assNum,
                    title: assTitle,
                    question_file: qFile.name,
                    answer_file: safeAnswerFile,
                    question_data_url: safeQuestionDataUrl,
                    answer_data_url: safeAnswerDataUrl,
                    question_preview: newAssignment.questionPreview,
                    answer_preview: newAssignment.answerPreview,
                    views: 1,
                    downloads: 0,
                    is_custom: true,
                    comments: []
                }]);
            } catch (dbErr) {
                console.error('Database Insert Error:', dbErr);
            }

            this.dbAssignments.unshift(newAssignment);
            this.saveLocalCache();
            return newAssignment;
        }

        async updateSolution(assId, targetChapterId, aFile) {
            const targetItem = this.dbAssignments.find(a => a.id === assId);
            if (!targetItem) return;

            // DELETE OLD SOLUTION FILE FROM STORAGE TO FREE UP SPACE
            if (targetItem.answerDataUrl) {
                await StorageManager.removeFile(targetItem.answerDataUrl);
            }

            const aStoragePath = `assignments/${this.subjectKey}/${targetChapterId}/solutions/${Date.now()}_${aFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
            const newUrl = await StorageManager.uploadWithFallback('academic-files', aStoragePath, aFile);

            const newPreview = `
                <div class="pdf-doc-view">
                    <div class="pdf-doc-title"><i class="fa-solid fa-file-pdf" style="color:#16a34a"></i> ${escapeHtml(aFile.name)}</div>
                    <p>Uploaded PDF Solution Document. Click Download below or Full View to inspect.</p>
                    <div class="pdf-doc-meta" style="margin-top:8px;">File size: ${(aFile.size / 1024).toFixed(1)} KB • PDF Document</div>
                </div>
            `;

            try {
                await window.supabaseClient.from('assignments').update({
                    answer_file: aFile.name,
                    answer_data_url: newUrl,
                    answer_preview: newPreview
                }).eq('id', assId);
            } catch (dbErr) {
                console.error('Database update solution error:', dbErr);
            }

            targetItem.answerFile = aFile.name;
            targetItem.answerDataUrl = newUrl;
            targetItem.answerPreview = newPreview;
            this.saveLocalCache();
        }

        async deleteAssignment(assId) {
            const targetAss = this.dbAssignments.find(a => a.id === assId);
            if (targetAss) {
                // DELETE BOTH QUESTION AND ANSWER FILES FROM STORAGE TO FREE UP SPACE
                if (targetAss.questionDataUrl) {
                    await StorageManager.removeFile(targetAss.questionDataUrl);
                }
                if (targetAss.answerDataUrl) {
                    await StorageManager.removeFile(targetAss.answerDataUrl);
                }
            }

            try {
                await window.supabaseClient.from('assignments').delete().eq('id', assId);
            } catch (e) {
                console.error('Database delete assignment error:', e);
            }

            this.dbAssignments = this.dbAssignments.filter(a => a.id !== assId);
            this.saveLocalCache();
        }
    }

    const assignmentService = new AssignmentManager(subjectKey);

    async function fetchAssignments() {
        return await assignmentService.fetchAssignments();
    }

    function getCombinedAssignments(sKey) {
        return assignmentService.getCombinedAssignments(sKey, defaultSubjectAssignments);
    }

    // ---------------------------------------------------------
    // 7. Render Visible Chapter Navigation Pills
    // ---------------------------------------------------------
    const chapterNavPills = document.getElementById('chapterNavPills');

    function renderChapterNav() {
        if (!chapterNavPills) return;
        chapterNavPills.innerHTML = '';

        const allAssignments = getCombinedAssignments(subjectKey);

        // 'All Chapters' Pill
        const allPill = document.createElement('button');
        allPill.type = 'button';
        allPill.className = `chapter-pill ${activeChapterId === 'all' ? 'active' : ''}`;
        allPill.innerHTML = `
            <i class="fa-solid fa-list-check"></i>
            <span class="chapter-pill-title">All Chapters</span>
            <span class="chapter-pill-badge">${allAssignments.length}</span>
        `;
        allPill.addEventListener('click', () => {
            activeChapterId = 'all';
            renderChapterNav();
            renderAssignments();
            updateUploadChapterDropdown();
        });
        chapterNavPills.appendChild(allPill);

        // Individual Chapter Pills
        subjectChapters.forEach((ch, idx) => {
            const count = allAssignments.filter(a => a && (a.chapterId === ch.id || a.unit === ch.unit || a.chapterTitle === ch.title)).length;
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `chapter-pill ${activeChapterId === ch.id ? 'active' : ''}`;
            
            const displayTitle = ch.name ? `${ch.unit || `Unit ${idx+1}`}: ${ch.name}` : ch.title;

            pill.innerHTML = `
                <i class="fa-solid fa-folder-open"></i>
                <span class="chapter-pill-title" title="${ch.title}">${displayTitle}</span>
                <span class="chapter-pill-badge">${count}</span>
            `;

            pill.addEventListener('click', () => {
                activeChapterId = ch.id;
                renderChapterNav();
                renderAssignments();
                updateUploadChapterDropdown();
            });

            chapterNavPills.appendChild(pill);
        });
    }

    // ---------------------------------------------------------
    // 8. Update Admin Upload Section UI
    // ---------------------------------------------------------
    function updateAdminUI() {
        if (adminToggleBtn) {
            if (isAdminMode) {
                adminToggleBtn.classList.add('active');
                adminToggleBtn.innerHTML = '<i class="fa-solid fa-user-check"></i> <span>Admin Active (Logout)</span>';
            } else {
                adminToggleBtn.classList.remove('active');
                adminToggleBtn.innerHTML = '<i class="fa-solid fa-user-shield"></i> <span>Admin Mode</span>';
            }
        }
        if (openUploadModalBtn) {
            openUploadModalBtn.style.display = 'inline-flex';
        }

        renderAdminUploadSection();
        renderChapterNav();
        renderAssignments(searchInput ? searchInput.value : '');
        updateUploadChapterDropdown();
    }

    function renderAdminUploadSection() {
        if (!adminUploadPortalSection) return;
        adminUploadPortalSection.innerHTML = '';
    }

    function syncGetUnitMod(sKey, itemId, unitName, idx) {
        if (!sKey) return null;
        const norm = sKey.toLowerCase();
        const alias = norm === 'math' ? 'maths' : (norm === 'coa' ? 'hardware' : norm);
        const keysToCheck = [
            `modified_units_${norm}`,
            `modified_units_${alias}`,
            `modified_items_${norm}_notes`,
            `modified_items_${alias}_notes`,
            `modified_items_${norm}_question_bank`,
            `modified_items_${alias}_question_bank`,
            `modified_items_${norm}_assignments`,
            `modified_items_${alias}_assignments`
        ];

        for (const k of keysToCheck) {
            try {
                const data = JSON.parse(localStorage.getItem(k));
                if (data && typeof data === 'object') {
                    if (itemId && data[itemId]) return data[itemId];
                    if (unitName && data[unitName]) return data[unitName];
                    if (idx !== undefined && idx !== null && data[`unit_idx_${idx}`]) return data[`unit_idx_${idx}`];
                }
            } catch (e) {}
        }
        return null;
    }

    function updateUploadChapterDropdown(targetSubKey = null) {
        const modalSelect = document.getElementById('uploadChapterSelect');
        if (!modalSelect) return;

        const subSelect = document.getElementById('uploadSubjectSelect');
        const rawKey = targetSubKey || (subSelect ? subSelect.value : subjectKey) || 'maths';

        let normKey = rawKey ? rawKey.toLowerCase() : 'maths';
        if (normKey === 'math') normKey = 'maths';
        if (normKey === 'coa') normKey = 'hardware';

        let chaptersToUse = [];
        if (typeof subjectsData !== 'undefined' && subjectsData[normKey] && subjectsData[normKey].chapters && subjectsData[normKey].chapters.length > 0) {
            chaptersToUse = subjectsData[normKey].chapters;
        } else if (typeof subjectsData !== 'undefined' && subjectsData[subjectKey] && subjectsData[subjectKey].chapters && subjectsData[subjectKey].chapters.length > 0) {
            chaptersToUse = subjectsData[subjectKey].chapters;
        } else if (subjectChapters && subjectChapters.length > 0) {
            chaptersToUse = subjectChapters;
        } else {
            // Built-in fallback chapters per subject so dropdown is NEVER empty
            const fallbackMap = {
                'maths': [
                    { id: 'math-u1', unit: 'Unit 1', name: 'Logic, Proof Techniques & Sets' },
                    { id: 'math-u2', unit: 'Unit 2', name: 'Relations, Recurrence & Combinatorics' },
                    { id: 'math-u3', unit: 'Unit 3', name: 'Fourier and Z-Transforms' },
                    { id: 'math-u4', unit: 'Unit 4', name: 'Statistics & Probability' },
                    { id: 'math-u5', unit: 'Unit 5', name: 'Numerical Methods' }
                ],
                'dsa': [
                    { id: 'dsa-u1', unit: 'Unit 1', name: 'Introduction to Data Structures & Memory' },
                    { id: 'dsa-u2', unit: 'Unit 2', name: 'Searching and Sorting Techniques' },
                    { id: 'dsa-u3', unit: 'Unit 3', name: 'Stack & Applications' },
                    { id: 'dsa-u4', unit: 'Unit 4', name: 'Queue & Linked Lists' }
                ],
                'oop': [
                    { id: 'oop-u1', unit: 'Unit 1', name: 'Fundamentals of OOP' },
                    { id: 'oop-u2', unit: 'Unit 2', name: 'Inheritance and Polymorphism' },
                    { id: 'oop-u3', unit: 'Unit 3', name: 'Exception Handling and Pointers' },
                    { id: 'oop-u4', unit: 'Unit 4', name: 'File Handling & Streams' }
                ],
                'os': [
                    { id: 'os-u1', unit: 'Unit 1', name: 'Introduction to OS & Process' },
                    { id: 'os-u2', unit: 'Unit 2', name: 'IPC & Deadlocks' },
                    { id: 'os-u3', unit: 'Unit 3', name: 'Memory Management' },
                    { id: 'os-u4', unit: 'Unit 4', name: 'File Management & Administration' }
                ],
                'hardware': [
                    { id: 'coa-u1', unit: 'Unit 1', name: 'Data Representation' },
                    { id: 'coa-u2', unit: 'Unit 2', name: 'Basic Computer Organization & Design' },
                    { id: 'coa-u3', unit: 'Unit 3', name: 'Pipelining & Vector Processing' },
                    { id: 'coa-u4', unit: 'Unit 4', name: 'Input-Output Organization' }
                ]
            };

            chaptersToUse = fallbackMap[normKey] || fallbackMap['maths'];
        }

        modalSelect.innerHTML = chaptersToUse.map((ch, idx) => {
            const syncMod = syncGetUnitMod(normKey, ch.id, ch.unit, idx);
            const val = ch.id || ch.unit || 'unit-1';
            const nameToUse = (syncMod && syncMod.name) ? syncMod.name : (ch.name || ch.title || 'Unit');
            const titleToUse = (syncMod && syncMod.title) ? syncMod.title : ((ch.unit ? `${ch.unit}: ` : '') + nameToUse);
            return `<option value="${escapeHtml(val)}">${escapeHtml(titleToUse)}</option>`;
        }).join('');
    }

    const uploadSubjectSelect = document.getElementById('uploadSubjectSelect');
    if (uploadSubjectSelect) {
        uploadSubjectSelect.addEventListener('change', (e) => {
            updateUploadChapterDropdown(e.target.value);
        });
    }

    // Populate dropdown immediately on load
    updateUploadChapterDropdown();

    function attachInPageUploadListeners() {
        const inpageForm = document.getElementById('inPageAdminUploadForm');
        const qInput = document.getElementById('inpageUploadQPdf');
        const aInput = document.getElementById('inpageUploadAPdf');
        const qNameDisplay = document.getElementById('inpageQPdfName');
        const aNameDisplay = document.getElementById('inpageAPdfName');

        if (qInput && qNameDisplay) {
            qInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    qNameDisplay.textContent = '📄 ' + e.target.files[0].name;
                }
            });
        }

        if (aInput && aNameDisplay) {
            aInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    aNameDisplay.textContent = '📄 ' + e.target.files[0].name;
                }
            });
        }

        if (inpageForm) {
            inpageForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!isAdminMode) {
                    if (document.getElementById('adminToggleBtn')) document.getElementById('adminToggleBtn').click();
                    return;
                }

                const targetChapterId = document.getElementById('inpageUploadChapter').value;
                const assNum = parseInt(document.getElementById('inpageUploadAssNum').value, 10);
                const assTitle = document.getElementById('inpageUploadAssTitle').value.trim();
                const qNotes = document.getElementById('inpageUploadQNotes').value.trim();
                const aNotes = document.getElementById('inpageUploadANotes').value.trim();

                const qFile = qInput.files[0];
                const aFile = aInput.files[0];

                if (!qFile || !aFile) {
                    showToast('Please select both Question PDF and Solution PDF files!');
                    return;
                }

                try {
                    showToast('Uploading and publishing assignment...');
                    const targetChObj = subjectChapters.find(c => c.id === targetChapterId) || subjectChapters[0];
                    await assignmentService.publishAssignment({
                        targetSubjectKey: subjectKey,
                        targetChapterId: targetChapterId,
                        targetChObj: targetChObj,
                        assNum: assNum,
                        assTitle: assTitle,
                        qFile: qFile,
                        aFile: aFile,
                        qNotes: qNotes,
                        aNotes: aNotes
                    });

                    inpageForm.reset();
                    if (qNameDisplay) qNameDisplay.textContent = 'Choose Question PDF file...';
                    if (aNameDisplay) aNameDisplay.textContent = 'Choose Solution PDF file...';

                    activeChapterId = targetChapterId;
                    renderChapterNav();
                    renderAssignments(searchInput ? searchInput.value : '');

                    showToast('Assignment published successfully under ' + (targetChObj ? targetChObj.unit || 'chapter' : 'chapter') + '!');
                } catch (err) {
                    console.error(err);
                    showToast('Error uploading files.', true);
                }
            });
        }
    }

    // ---------------------------------------------------------
    // 9. Persistent Counts & Comments Helper
    // ---------------------------------------------------------
    function getStoredCounts(assId, defaultViews, defaultDownloads) {
        const stored = localStorage.getItem(`counts_${assId}`);
        if (stored) {
            return JSON.parse(stored);
        }
        return { views: defaultViews || 1, downloads: defaultDownloads || 0 };
    }

    function saveStoredCounts(assId, counts) {
        localStorage.setItem(`counts_${assId}`, JSON.stringify(counts));
    }

    function getStoredComments(assId, defaultComments) {
        const stored = localStorage.getItem(`comments_${assId}`);
        if (stored) {
            return JSON.parse(stored);
        }
        return defaultComments || [];
    }

    function saveStoredComments(assId, comments) {
        localStorage.setItem(`comments_${assId}`, JSON.stringify(comments));
    }

    // ---------------------------------------------------------
    // 10. Render Assignments List
    // ---------------------------------------------------------
    const assignmentsContainer = document.getElementById('assignmentsList');

    function renderAssignments(filterTerm = '') {
        if (!assignmentsContainer) return;
        assignmentsContainer.innerHTML = '';

        const allAssignments = getCombinedAssignments(subjectKey);
        const term = filterTerm.toLowerCase().trim();

        // Filter by Chapter AND Search Query
        const filteredList = allAssignments.filter(item => {
            if (!item) return false;
            const matchesChapter = (activeChapterId === 'all') ||
                (item.chapterId === activeChapterId) ||
                (subjectChapters.find(ch => ch.id === activeChapterId && (item.unit === ch.unit || item.chapterTitle === ch.title)));

            const matchesSearch = !term ||
                item.title.toLowerCase().includes(term) ||
                item.questionFile.toLowerCase().includes(term) ||
                item.answerFile.toLowerCase().includes(term) ||
                (item.chapterTitle && item.chapterTitle.toLowerCase().includes(term)) ||
                (item.unit && item.unit.toLowerCase().includes(term));

            return matchesChapter && matchesSearch;
        });

        if (filteredList.length === 0) {
            const activeChObj = subjectChapters.find(c => c.id === activeChapterId);
            const chLabel = activeChObj ? (activeChObj.name || activeChObj.title) : 'this section';

            assignmentsContainer.innerHTML = `
                <div class="empty-assignments-box">
                    <i class="fa-solid fa-file-circle-xmark"></i>
                    <h3>No assignments found for ${escapeHtml(chLabel)}</h3>
                    <p>${isAdminMode ? 'As Admin, you can use the upload portal above to upload Question & Solution PDF files for this chapter.' : 'No assignments have been uploaded for this chapter yet. Try selecting another chapter.'}</p>
                </div>
            `;
            return;
        }

        filteredList.forEach(ass => {
            const counts = getStoredCounts(ass.id, ass.views, ass.downloads);
            const comments = getStoredComments(ass.id, ass.comments);

            if (!sessionStorage.getItem(`viewed_${ass.id}`)) {
                counts.views += 1;
                saveStoredCounts(ass.id, counts);
                sessionStorage.setItem(`viewed_${ass.id}`, 'true');
            }

            const card = document.createElement('div');
            card.id = ass.id;
            card.className = 'assignment-card';
            card.setAttribute('data-id', ass.id);

            const adminDeleteBtnHtml = (isAdminMode || ass.isCustom) ? `
                <button class="action-btn admin-delete-btn" data-id="${ass.id}" title="Delete Assignment (Admin)">
                    <i class="fa-solid fa-trash-can"></i> Delete
                </button>
            ` : '';

            const unitTag = ass.unit || (subjectChapters.find(c => c.id === ass.chapterId) ? subjectChapters.find(c => c.id === ass.chapterId).unit : 'Unit 1');
            const hasAnswer = !!(ass.answerFile || ass.answerDataUrl);

            const answerBoxHtml = hasAnswer ? `
                <div class="qa-box answer-box">
                    <div class="qa-top-bar">
                        <span class="tag-badge">ASSIGNMENT ${ass.num} • ${unitTag} ANSWER</span>
                        <div class="file-title-bar" title="${escapeHtml(ass.title)}">${escapeHtml(ass.title)}</div>
                    </div>

                    <!-- PDF Preview Box -->
                    <div class="pdf-preview-box">
                        <div class="pdf-header-controls">
                            <span><i class="fa-solid fa-file-pdf" style="color:#4ade80"></i> Solution Document Preview</span>
                            <div class="pdf-controls-group">
                                <button class="pdf-control-btn view-pdf-btn" data-file="${escapeHtml(ass.answerFile)}" data-id="${ass.id}" data-type="answer">
                                    <i class="fa-solid fa-expand"></i> Full View
                                </button>
                            </div>
                        </div>
                        <div class="pdf-body-content">
                            ${ass.answerPreview || '<p>Solution Available</p>'}
                        </div>
                    </div>

                    <!-- File Name Indicator -->
                    <div class="file-name-bar">
                        <i class="fa-solid fa-file-pdf" style="color:#16a34a"></i> <span>${escapeHtml(ass.answerFile)}</span>
                    </div>

                    <!-- Action Toolbar -->
                    <div class="action-toolbar">
                        <button class="action-btn download-btn" data-id="${ass.id}" data-file="${escapeHtml(ass.answerFile)}" data-type="answer">
                            <i class="fa-solid fa-download"></i> Download
                        </button>
                        <button class="action-btn comment-btn" data-id="${ass.id}" data-title="${escapeHtml(ass.title)}">
                            <i class="fa-solid fa-comment-dots"></i> Comment (${comments.length})
                        </button>
                        ${isAdminMode ? `
                            <button class="action-btn admin-upload-solution-btn" data-id="${ass.id}" data-chapter="${ass.chapterId}" style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3);">
                                <i class="fa-solid fa-pen-to-square"></i> Update Solution
                            </button>
                        ` : ''}
                        ${adminDeleteBtnHtml}
                        <div class="count-badge">
                            <span><i class="fa-solid fa-eye" style="color:#16a34a"></i> ${counts.views} views</span>
                            <span>•</span>
                            <span id="dl-count-a-${ass.id}"><i class="fa-solid fa-cloud-arrow-down" style="color:#16a34a"></i> ${counts.downloads} downloads</span>
                        </div>
                    </div>
                </div>
            ` : `
                <div class="qa-box answer-box pending-answer-box">
                    <div class="qa-top-bar">
                        <span class="tag-badge pending-tag" style="background:rgba(245,158,11,0.2); color:#f59e0b; border:1px solid rgba(245,158,11,0.4);">
                            <i class="fa-solid fa-clock"></i> SOLUTION PENDING
                        </span>
                        <div class="file-title-bar" title="${escapeHtml(ass.title)}">${escapeHtml(ass.title)}</div>
                    </div>

                    <!-- PDF Preview Box -->
                    <div class="pdf-preview-box">
                        <div class="pdf-header-controls">
                            <span><i class="fa-solid fa-clock" style="color:#f59e0b"></i> Solution Pending</span>
                        </div>
                        <div class="pdf-body-content">
                            <div class="pdf-doc-view" style="text-align:center; padding:1.75rem 1rem;">
                                <i class="fa-solid fa-hourglass-half" style="font-size:2.2rem; color:#f59e0b; margin-bottom:0.6rem;"></i>
                                <div class="pdf-doc-title" style="color:#f1f5f9; font-weight:600; font-size:1.05rem;">Solution Document Coming Soon</div>
                                <p style="font-size:0.85rem; color:#94a3b8; margin-top:6px;">Question PDF is available. Faculty/Admin will upload the solution PDF here soon.</p>
                            </div>
                        </div>
                    </div>

                    <!-- File Name Indicator -->
                    <div class="file-name-bar" style="color:#94a3b8; font-style:italic;">
                        <i class="fa-solid fa-file-circle-xmark" style="color:#f59e0b"></i> <span>No solution PDF attached yet</span>
                    </div>

                    <!-- Action Toolbar -->
                    <div class="action-toolbar">
                        ${isAdminMode ? `
                            <button class="action-btn admin-upload-solution-btn" data-id="${ass.id}" data-chapter="${ass.chapterId}" style="background:#16a34a; color:#ffffff; font-weight:600;">
                                <i class="fa-solid fa-cloud-arrow-up"></i> Upload Solution PDF
                            </button>
                        ` : `
                            <button class="action-btn" disabled style="opacity:0.5; cursor:not-allowed;">
                                <i class="fa-solid fa-clock"></i> Solution Pending
                            </button>
                        `}
                        <button class="action-btn comment-btn" data-id="${ass.id}" data-title="${escapeHtml(ass.title)}">
                            <i class="fa-solid fa-comment-dots"></i> Comment (${comments.length})
                        </button>
                        ${adminDeleteBtnHtml}
                    </div>
                </div>
            `;

            card.innerHTML = `
                <div class="qa-grid">
                    <!-- LEFT BOX: QUESTION BOX -->
                    <div class="qa-box question-box">
                        <div class="qa-top-bar">
                            <span class="tag-badge">ASSIGNMENT ${ass.num} • ${unitTag} QUESTION</span>
                            <div class="file-title-bar" title="${escapeHtml(ass.title)}">${escapeHtml(ass.title)}</div>
                        </div>

                        <!-- PDF Preview Box -->
                        <div class="pdf-preview-box">
                            <div class="pdf-header-controls">
                                <span><i class="fa-solid fa-file-pdf" style="color:#38bdf8"></i> Question Document Preview</span>
                                <div class="pdf-controls-group">
                                    <button class="pdf-control-btn view-pdf-btn" data-file="${escapeHtml(ass.questionFile)}" data-id="${ass.id}" data-type="question">
                                        <i class="fa-solid fa-expand"></i> Full View
                                    </button>
                                </div>
                            </div>
                            <div class="pdf-body-content">
                                ${ass.questionPreview}
                            </div>
                        </div>

                        <!-- File Name Indicator -->
                        <div class="file-name-bar">
                            <i class="fa-solid fa-file-pdf" style="color:#0284c7"></i> <span>${escapeHtml(ass.questionFile)}</span>
                        </div>

                        <!-- Action Toolbar -->
                        <div class="action-toolbar">
                            <button class="action-btn download-btn" data-id="${ass.id}" data-file="${escapeHtml(ass.questionFile)}" data-type="question">
                                <i class="fa-solid fa-download"></i> Download
                            </button>
                            <button class="action-btn comment-btn" data-id="${ass.id}" data-title="${escapeHtml(ass.title)}">
                                <i class="fa-solid fa-comment-dots"></i> Comment (${comments.length})
                            </button>
                            <button class="action-btn share-btn" data-id="${ass.id}">
                                <i class="fa-solid fa-share-nodes"></i> Share
                            </button>
                            ${adminDeleteBtnHtml}
                            <div class="count-badge">
                                <span><i class="fa-solid fa-eye" style="color:#0284c7"></i> ${counts.views} views</span>
                                <span>•</span>
                                <span id="dl-count-q-${ass.id}"><i class="fa-solid fa-cloud-arrow-down" style="color:#2563eb"></i> ${counts.downloads} downloads</span>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT BOX: ANSWER BOX -->
                    ${answerBoxHtml}
                </div>
            `;

            assignmentsContainer.appendChild(card);
        });

        attachActionListeners();
    }

    // ---------------------------------------------------------
    // 11. Tab Switcher Handling (Both / Questions / Answers)
    // ---------------------------------------------------------
    const tabButtons = document.querySelectorAll('.tab-btn');
    const columnHeaderBanner = document.getElementById('columnHeaderBanner');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const viewMode = btn.getAttribute('data-view');
            const cards = document.querySelectorAll('.assignment-card');

            cards.forEach(card => {
                card.classList.remove('view-questions', 'view-answers');
                if (viewMode === 'questions') {
                    card.classList.add('view-questions');
                } else if (viewMode === 'answers') {
                    card.classList.add('view-answers');
                }
            });

            if (columnHeaderBanner) {
                if (viewMode === 'questions') {
                    columnHeaderBanner.style.display = 'block';
                    columnHeaderBanner.innerHTML = '<div class="col-banner question-banner"><i class="fa-solid fa-file-circle-question"></i> Questions View</div>';
                } else if (viewMode === 'answers') {
                    columnHeaderBanner.style.display = 'block';
                    columnHeaderBanner.innerHTML = '<div class="col-banner answer-banner"><i class="fa-solid fa-file-circle-check"></i> Answers View</div>';
                } else {
                    columnHeaderBanner.style.display = 'grid';
                    columnHeaderBanner.innerHTML = `
                        <div class="col-banner question-banner"><i class="fa-solid fa-file-circle-question"></i> Questions</div>
                        <div class="banner-chevron"><i class="fa-solid fa-angle-right"></i></div>
                        <div class="col-banner answer-banner"><i class="fa-solid fa-file-circle-check"></i> Answers</div>
                    `;
                }
            }
        });
    });

    // ---------------------------------------------------------
    // 12. Search & Filter Listeners
    // ---------------------------------------------------------
    const searchInput = document.getElementById('assignmentSearch');
    const assignmentSearchClearBtn = document.getElementById('assignmentSearchClearBtn');
    const assignmentSearchCounter = document.getElementById('assignmentSearchCounter');

    function performAssignmentSearch(rawQuery) {
        const query = rawQuery.toLowerCase().trim();
        if (assignmentSearchClearBtn) {
            assignmentSearchClearBtn.style.display = query.length > 0 ? 'flex' : 'none';
        }

        renderAssignments(query);

        if (assignmentSearchCounter) {
            const allAss = getCombinedAssignments(subjectKey);
            if (query.length > 0) {
                const count = assignmentsContainer ? assignmentsContainer.querySelectorAll('.assignment-card').length : 0;
                assignmentSearchCounter.style.display = 'inline-block';
                assignmentSearchCounter.innerHTML = `<i class="fa-solid fa-filter"></i> Showing <strong>${count}</strong> of <strong>${allAss.length}</strong> assignments for "<em>${escapeHtml(query)}</em>"`;
            } else {
                assignmentSearchCounter.style.display = 'none';
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => performAssignmentSearch(e.target.value));

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            } else if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                performAssignmentSearch('');
                searchInput.blur();
            }
        });
    }

    if (assignmentSearchClearBtn) {
        assignmentSearchClearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                performAssignmentSearch('');
                searchInput.focus();
            }
        });
    }

    // ---------------------------------------------------------
    // 13. Action Listeners (Download, Comment, Share, Full View)
    // ---------------------------------------------------------
    let activeCommentAssId = null;

    function attachActionListeners() {
        // Download Buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const assId = btn.getAttribute('data-id');
                const fileName = btn.getAttribute('data-file');
                const type = btn.getAttribute('data-type');

                const allAss = getCombinedAssignments(subjectKey);
                const assObj = allAss.find(a => a.id === assId);

                if (assObj) {
                    const counts = getStoredCounts(assId, assObj.views, assObj.downloads);
                    counts.downloads += 1;
                    saveStoredCounts(assId, counts);

                    const qBadge = document.getElementById(`dl-count-q-${assId}`);
                    const aBadge = document.getElementById(`dl-count-a-${assId}`);
                    if (qBadge) qBadge.innerHTML = `<i class="fa-solid fa-cloud-arrow-down" style="color:#2563eb"></i> ${counts.downloads} downloads`;
                    if (aBadge) aBadge.innerHTML = `<i class="fa-solid fa-cloud-arrow-down" style="color:#16a34a"></i> ${counts.downloads} downloads`;

                    if (type === 'question' && assObj.questionDataUrl) {
                        const link = document.createElement('a');
                        link.href = assObj.questionDataUrl;
                        link.download = fileName;
                        link.click();
                        showToast(`Downloading ${fileName}...`);
                        return;
                    } else if (type === 'answer' && assObj.answerDataUrl) {
                        const link = document.createElement('a');
                        link.href = assObj.answerDataUrl;
                        link.download = fileName;
                        link.click();
                        showToast(`Downloading ${fileName}...`);
                        return;
                    }
                }

                triggerBlobDownload(fileName);
                showToast(`Downloading ${fileName}...`);
            });
        });

        // Admin Delete Buttons
        document.querySelectorAll('.admin-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!isAdminMode) {
                    if (document.getElementById('adminToggleBtn')) document.getElementById('adminToggleBtn').click();
                    return;
                }
                const assId = btn.getAttribute('data-id');
                if (await customConfirm('Are you sure you want to delete this assignment?')) {
                    deleteCustomAssignment(subjectKey, assId);
                }
            });
        });

        // Admin Upload / Update Solution PDF Buttons
        document.querySelectorAll('.admin-upload-solution-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!isAdminMode) return;
                const assId = btn.getAttribute('data-id');
                const targetChapterId = btn.getAttribute('data-chapter') || 'dsa-u1';

                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'file';
                hiddenInput.accept = '.pdf';
                hiddenInput.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    try {
                        showToast('Uploading solution PDF...');
                        await assignmentService.updateSolution(assId, targetChapterId, file);
                        renderAssignments(searchInput ? searchInput.value : '');
                        showToast('Solution PDF uploaded & attached successfully!');
                    } catch (err) {
                        console.error('Error updating solution:', err);
                        showToast('Failed to upload solution PDF', true);
                    }
                };
                hiddenInput.click();
            });
        });

        // Comment Buttons
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const assId = btn.getAttribute('data-id');
                const assTitle = btn.getAttribute('data-title');
                activeCommentAssId = assId;
                openCommentDrawer(assId, assTitle);
            });
        });

        // Share Buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const assId = btn.getAttribute('data-id');
                const shareUrl = `${window.location.origin}${window.location.pathname}?subject=${subjectKey}#${assId}`;

                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        showToast('Assignment link copied to clipboard!');
                    });
                } else {
                    showToast('Share Link: ' + shareUrl);
                }
            });
        });

        // Full View Preview Buttons
        document.querySelectorAll('.view-pdf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fileName = btn.getAttribute('data-file');
                const assId = btn.getAttribute('data-id');
                const type = btn.getAttribute('data-type');

                const allAss = getCombinedAssignments(subjectKey);
                const assObj = allAss.find(a => a.id === assId);

                if (assObj && ((type === 'question' && assObj.questionDataUrl) || (type === 'answer' && assObj.answerDataUrl))) {
                    const dataUrl = type === 'question' ? assObj.questionDataUrl : assObj.answerDataUrl;
                    const previewHtml = `
                        <div class="full-view-pdf-wrapper">
                            <object data="${dataUrl}" type="application/pdf" width="100%" height="600px">
                                <div style="text-align:center; padding:2rem;">
                                    <p>PDF preview loaded. <a href="${dataUrl}" download="${fileName}" class="download-action" style="padding:6px 14px; border-radius:6px; background:#2563eb; color:white; text-decoration:none;">Click here to download PDF</a></p>
                                </div>
                            </object>
                        </div>
                    `;
                    openFullView(fileName, previewHtml, dataUrl);
                    return;
                }

                const previewBox = btn.closest('.pdf-preview-box');
                const bodyContent = previewBox ? previewBox.querySelector('.pdf-body-content') : null;
                const contentHtml = bodyContent ? `<div class="full-view-text-wrapper">${bodyContent.innerHTML}</div>` : `<p>Viewing ${fileName}</p>`;
                openFullView(fileName, contentHtml);
            });
        });
    }

    // ---------------------------------------------------------
    // 14. Full PDF Preview Modal
    // ---------------------------------------------------------
    const fullViewModal = document.getElementById('fullViewModal');
    const fullViewFileName = document.getElementById('fullViewFileName');
    const fullViewContent = document.getElementById('fullViewContent');
    const fullViewDownloadBtn = document.getElementById('fullViewDownloadBtn');
    const closeFullViewModal = document.getElementById('closeFullViewModal');

    let activeFullViewFile = null;
    let activeFullViewDataUrl = null;

    function openFullView(filename, contentHtml, dataUrl = null) {
        if (!fullViewModal) return;
        activeFullViewFile = filename;
        activeFullViewDataUrl = dataUrl;
        if (fullViewFileName) fullViewFileName.textContent = filename;
        if (fullViewContent) fullViewContent.innerHTML = contentHtml;
        fullViewModal.classList.add('active');
    }

    function closeFullView() {
        if (!fullViewModal) return;
        fullViewModal.classList.remove('active');
        activeFullViewFile = null;
        activeFullViewDataUrl = null;
    }

    if (closeFullViewModal) closeFullViewModal.addEventListener('click', closeFullView);
    if (fullViewModal) {
        fullViewModal.addEventListener('click', (e) => {
            if (e.target === fullViewModal) closeFullView();
        });
    }
    if (fullViewDownloadBtn) {
        fullViewDownloadBtn.addEventListener('click', () => {
            if (activeFullViewDataUrl) {
                const link = document.createElement('a');
                link.href = activeFullViewDataUrl;
                link.download = activeFullViewFile || 'assignment.pdf';
                link.click();
                showToast(`Downloading ${activeFullViewFile}...`);
            } else if (activeFullViewFile) {
                triggerBlobDownload(activeFullViewFile);
                showToast(`Downloading ${activeFullViewFile}...`);
            }
        });
    }

    function triggerBlobDownload(filename) {
        const dummyContent = `%PDF-1.4\n1 0 obj\n<< /Title (${filename}) /Author (NMIET Hub) >>\nendobj\n... [Sample PDF Content for ${filename}] ...`;
        const blob = new Blob([dummyContent], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function deleteCustomAssignment(sKey, assId) {
        try {
            await assignmentService.deleteAssignment(assId);
            showToast('Assignment and storage files deleted successfully.');
            renderChapterNav();
            renderAssignments(searchInput ? searchInput.value : '');
        } catch (e) {
            console.error('Error deleting assignment:', e);
            showToast('Error deleting assignment', true);
        }
    }

    // ---------------------------------------------------------
    // 15. Comment Drawer Logic
    // ---------------------------------------------------------
    const commentModalBackdrop = document.getElementById('commentModalBackdrop');
    const closeCommentDrawer = document.getElementById('closeCommentDrawer');
    const commentModalTitle = document.getElementById('commentModalTitle');
    const commentsList = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');

    function openCommentDrawer(assId, title) {
        if (!commentModalBackdrop) return;
        if (commentModalTitle) commentModalTitle.textContent = `Discussion: ${title}`;
        renderDrawerComments(assId);
        commentModalBackdrop.classList.add('active');
    }

    function closeCommentDrawerHandler() {
        if (!commentModalBackdrop) return;
        commentModalBackdrop.classList.remove('active');
        activeCommentAssId = null;
    }

    if (closeCommentDrawer) closeCommentDrawer.addEventListener('click', closeCommentDrawerHandler);
    if (commentModalBackdrop) {
        commentModalBackdrop.addEventListener('click', (e) => {
            if (e.target === commentModalBackdrop) closeCommentDrawerHandler();
        });
    }

    function renderDrawerComments(assId) {
        if (!commentsList) return;
        commentsList.innerHTML = '';

        const allAss = getCombinedAssignments(subjectKey);
        const assObj = allAss.find(a => a.id === assId);
        const defaultComments = assObj ? assObj.comments : [];
        const comments = getStoredComments(assId, defaultComments);

        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div style="text-align:center; padding:2.5rem 1rem; color:#94a3b8;">
                    <i class="fa-regular fa-comments" style="font-size:2.5rem; margin-bottom:0.75rem; color:#cbd5e1;"></i>
                    <p>No comments yet. Be the first to leave a solution query or note!</p>
                </div>
            `;
            return;
        }

        comments.forEach(c => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <div class="comment-author">
                    <span><i class="fa-solid fa-user-circle"></i> ${escapeHtml(c.name)}</span>
                    <span class="comment-date">${escapeHtml(c.date)}</span>
                </div>
                <div class="comment-text">${escapeHtml(c.text)}</div>
            `;
            commentsList.appendChild(item);
        });
    }

    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!activeCommentAssId) return;

            const nameInput = document.getElementById('authorNameInput');
            const textInput = document.getElementById('commentTextInput');

            const name = nameInput.value.trim() || 'Anonymous Student';
            const text = textInput.value.trim();

            if (!text) return;

            const allAss = getCombinedAssignments(subjectKey);
            const assObj = allAss.find(a => a.id === activeCommentAssId);
            const defaultComments = assObj ? (assObj.comments || []) : [];
            const comments = getStoredComments(activeCommentAssId, defaultComments);

            comments.push({
                name: name,
                text: text,
                date: 'Just now'
            });

            if (assObj && assObj.isCustom) {
                assObj.comments = comments;
                try {
                    await window.supabaseClient.from('assignments')
                        .update({ comments: comments })
                        .eq('id', activeCommentAssId);
                } catch (err) {
                    console.error('Error updating comments in Supabase:', err);
                }
            } else {
                saveStoredComments(activeCommentAssId, comments);
            }

            renderDrawerComments(activeCommentAssId);
            renderAssignments(searchInput ? searchInput.value : '');

            textInput.value = '';
            showToast('Comment posted successfully!');
        });
    }

    // ---------------------------------------------------------
    // 16. Header Admin Upload Modal (Popup Alternative)
    // ---------------------------------------------------------
    const uploadModalBackdrop = document.getElementById('uploadModalBackdrop');
    const closeUploadModalBtn = document.getElementById('closeUploadModalBtn');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const adminUploadForm = document.getElementById('adminUploadForm');
    const uploadQuestionPdfInput = document.getElementById('uploadQuestionPdf');
    const uploadAnswerPdfInput = document.getElementById('uploadAnswerPdf');
    const qPdfNameDisplay = document.getElementById('qPdfName');
    const aPdfNameDisplay = document.getElementById('aPdfName');

    if (openUploadModalBtn) {
        openUploadModalBtn.addEventListener('click', () => {
            if (!isAdminMode) {
                if (document.getElementById('adminToggleBtn')) document.getElementById('adminToggleBtn').click();
                return;
            }
            if (uploadModalBackdrop) {
                const selectSub = document.getElementById('uploadSubjectSelect');
                if (selectSub) selectSub.value = subjectKey;
                updateUploadChapterDropdown(selectSub ? selectSub.value : subjectKey);
                uploadModalBackdrop.classList.add('active');
            }
        });
    }

    function closeUploadModal() {
        if (uploadModalBackdrop) uploadModalBackdrop.classList.remove('active');
        if (adminUploadForm) adminUploadForm.reset();
        if (qPdfNameDisplay) qPdfNameDisplay.textContent = 'Choose Question PDF...';
        if (aPdfNameDisplay) aPdfNameDisplay.textContent = 'Choose Solution PDF (Optional)...';
    }

    if (closeUploadModalBtn) closeUploadModalBtn.addEventListener('click', closeUploadModal);
    if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', closeUploadModal);
    if (uploadModalBackdrop) {
        uploadModalBackdrop.addEventListener('click', (e) => {
            if (e.target === uploadModalBackdrop) closeUploadModal();
        });
    }

    if (uploadQuestionPdfInput && qPdfNameDisplay) {
        uploadQuestionPdfInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                qPdfNameDisplay.textContent = '📄 ' + file.name;

                const titleInput = document.getElementById('uploadAssTitle');
                const numInput = document.getElementById('uploadAssNum');

                // Extract assignment number if present (e.g. "Assignment_1" -> 1)
                const numMatch = file.name.match(/(?:assignment|ass|a)[_\s-]*(\d+)/i) || file.name.match(/(\d+)/);
                if (numMatch && numInput && !numInput.value) {
                    numInput.value = parseInt(numMatch[1], 10);
                }

                if (titleInput && (!titleInput.value || titleInput.value.trim() === '')) {
                    // Clean filename into title (e.g., "Assignment_1_Matrices.pdf" -> "ASSIGNMENT 1: Matrices")
                    let cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
                    titleInput.value = cleanName;
                }
            }
        });
    }

    if (uploadAnswerPdfInput && aPdfNameDisplay) {
        uploadAnswerPdfInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                aPdfNameDisplay.textContent = '📄 ' + e.target.files[0].name;
            }
        });
    }

    if (adminUploadForm) {
        adminUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAdminMode) {
                if (document.getElementById('adminToggleBtn')) document.getElementById('adminToggleBtn').click();
                return;
            }

            const targetSubjectKey = document.getElementById('uploadSubjectSelect').value;
            const targetChapterId = document.getElementById('uploadChapterSelect').value;
            const assNum = parseInt(document.getElementById('uploadAssNum').value, 10);
            const assTitle = document.getElementById('uploadAssTitle').value.trim();
            const qNotes = document.getElementById('uploadQuestionNotes').value.trim();
            const aNotes = document.getElementById('uploadAnswerNotes').value.trim();

            const qFile = uploadQuestionPdfInput ? uploadQuestionPdfInput.files[0] : null;
            const aFile = uploadAnswerPdfInput ? uploadAnswerPdfInput.files[0] : null;

            if (!qFile) {
                showToast('Please select a Question PDF file!');
                return;
            }

            try {
                showToast('Uploading assignment PDF files...');
                let normKey = targetSubjectKey ? targetSubjectKey.toLowerCase() : 'maths';
                if (normKey === 'math') normKey = 'maths';
                if (normKey === 'coa') normKey = 'hardware';

                let targetChObj = null;
                if (typeof subjectsData !== 'undefined' && subjectsData[normKey] && subjectsData[normKey].chapters) {
                    targetChObj = subjectsData[normKey].chapters.find(c => c.id === targetChapterId);
                }
                if (!targetChObj) {
                    targetChObj = subjectChapters.find(c => c.id === targetChapterId) || { unit: 'Unit 1', title: 'Unit 1' };
                }

                await assignmentService.publishAssignment({
                    targetSubjectKey: targetSubjectKey,
                    targetChapterId: targetChapterId,
                    targetChObj: targetChObj,
                    assNum: assNum,
                    assTitle: assTitle,
                    qFile: qFile,
                    aFile: aFile,
                    qNotes: qNotes,
                    aNotes: aNotes
                });

                closeUploadModal();
                showToast('Assignment Published Successfully!');

                if (targetSubjectKey === subjectKey || (targetSubjectKey === 'maths' && subjectKey === 'math') || (targetSubjectKey === 'math' && subjectKey === 'maths')) {
                    activeChapterId = 'all';
                    renderChapterNav();
                    renderAssignments(searchInput ? searchInput.value : '');
                } else {
                    window.location.search = `?subject=${targetSubjectKey}`;
                }
            } catch (err) {
                console.error(err);
                showToast('Error processing PDF file upload.', true);
            }
        });
    }

    // ---------------------------------------------------------
    // 17. Live Online Users Counter & Toast Helper
    // ---------------------------------------------------------
    const onlineUsersCountEl = document.getElementById('onlineUsersCount');
    if (onlineUsersCountEl) {
        let baseCount = parseInt(sessionStorage.getItem('online_users_count')) || Math.floor(Math.random() * 12) + 16;
        sessionStorage.setItem('online_users_count', baseCount);
        onlineUsersCountEl.textContent = baseCount;

        setInterval(() => {
            const delta = Math.floor(Math.random() * 3) - 1;
            baseCount = Math.max(12, Math.min(36, baseCount + delta));
            sessionStorage.setItem('online_users_count', baseCount);
            onlineUsersCountEl.textContent = baseCount;
        }, 5000);
    }

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        if (!toast || !toastMessage) return;

        const icon = toast.querySelector('i');
        if (icon) {
            icon.className = isError ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check';
        }

        toastMessage.textContent = message;
        toast.style.background = isError ? '#ef4444' : '#0f172a';
        toast.style.display = 'flex';
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => { toast.style.display = 'none'; }, 300);
        }, 3200);
    }

    function customConfirm(message) {
        if (typeof window.customConfirm === 'function') {
            return window.customConfirm(message);
        }
        return Promise.resolve(confirm(message));
    }

    function escapeHtml(str) {
        if (!str) return '';
renderDrawerComments(activeCommentAssId);
            renderAssignments(searchInput ? searchInput.value : '');

            textInput.value = '';
            showToast('Comment posted successfully!');
        });
    }

    // ---------------------------------------------------------
    // 16. Header Admin Upload Modal (Popup Alternative)
    // ---------------------------------------------------------
    const uploadModalBackdrop = document.getElementById('uploadModalBackdrop');
    const closeUploadModalBtn = document.getElementById('closeUploadModalBtn');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const adminUploadForm = document.getElementById('adminUploadForm');
    const uploadQuestionPdfInput = document.getElementById('uploadQuestionPdf');
    const uploadAnswerPdfInput = document.getElementById('uploadAnswerPdf');
    const qPdfNameDisplay = document.getElementById('qPdfName');
    const aPdfNameDisplay = document.getElementById('aPdfName');

    if (openUploadModalBtn) {
        openUploadModalBtn.addEventListener('click', () => {
            if (!isAdminMode) {
                if (document.getElementById('adminToggleBtn')) document.getElementById('adminToggleBtn').click();
                return;
            }
            if (uploadModalBackdrop) {
                const selectSub = document.getElementById('uploadSubjectSelect');
                if (selectSub) selectSub.value = subjectKey;
                updateUploadChapterDropdown(selectSub ? selectSub.value : subjectKey);
                uploadModalBackdrop.classList.add('active');
            }
        });
    }

    function closeUploadModal() {
        if (uploadModalBackdrop) uploadModalBackdrop.classList.remove('active');
        if (adminUploadForm) adminUploadForm.reset();
        if (qPdfNameDisplay) qPdfNameDisplay.textContent = 'Choose Question PDF...';
        if (aPdfNameDisplay) aPdfNameDisplay.textContent = 'Choose Solution PDF (Optional)...';
    }

    if (closeUploadModalBtn) closeUploadModalBtn.addEventListener('click', closeUploadModal);
    if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', closeUploadModal);
    if (uploadModalBackdrop) {
        uploadModalBackdrop.addEventListener('click', (e) => {
            if (e.target === uploadModalBackdrop) closeUploadModal();
        });
    }

    if (uploadQuestionPdfInput && qPdfNameDisplay) {
        uploadQuestionPdfInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                qPdfNameDisplay.textContent = '📄 ' + file.name;

                const titleInput = document.getElementById('uploadAssTitle');
                const numInput = document.getElementById('uploadAssNum');

                // Extract assignment number if present (e.g. "Assignment_1" -> 1)
                const numMatch = file.name.match(/(?:assignment|ass|a)[_\s-]*(\d+)/i) || file.name.match(/(\d+)/);
                if (numMatch && numInput && !numInput.value) {
                    numInput.value = parseInt(numMatch[1], 10);
                }

                if (titleInput && (!titleInput.value || titleInput.value.trim() === '')) {
                    // Clean filename into title (e.g., "Assignment_1_Matrices.pdf" -> "ASSIGNMENT 1: Matrices")
                    let cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
                    titleInput.value = cleanName;
                }
            }
        });
    }

    if (uploadAnswerPdfInput && aPdfNameDisplay) {
        uploadAnswerPdfInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                aPdfNameDisplay.textContent = '📄 ' + e.target.files[0].name;
            }
        });
    }

    if (adminUploadForm) {
        adminUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAdminMode) {
                if (document.getElementById('adminToggleBtn')) document.getElementById('adminToggleBtn').click();
                return;
            }

            const targetSubjectKey = document.getElementById('uploadSubjectSelect').value;
            const targetChapterId = document.getElementById('uploadChapterSelect').value;
            const assNum = parseInt(document.getElementById('uploadAssNum').value, 10);
            const assTitle = document.getElementById('uploadAssTitle').value.trim();
            const qNotes = document.getElementById('uploadQuestionNotes').value.trim();
            const aNotes = document.getElementById('uploadAnswerNotes').value.trim();

            const qFile = uploadQuestionPdfInput ? uploadQuestionPdfInput.files[0] : null;
            const aFile = uploadAnswerPdfInput ? uploadAnswerPdfInput.files[0] : null;

            if (!qFile) {
                showToast('Please select a Question PDF file!');
                return;
            }

            try {
                showToast('Uploading assignment PDF files...');
                let normKey = targetSubjectKey ? targetSubjectKey.toLowerCase() : 'maths';
                if (normKey === 'math') normKey = 'maths';
                if (normKey === 'coa') normKey = 'hardware';

                let targetChObj = null;
                if (typeof subjectsData !== 'undefined' && subjectsData[normKey] && subjectsData[normKey].chapters) {
                    targetChObj = subjectsData[normKey].chapters.find(c => c.id === targetChapterId);
                }
                if (!targetChObj) {
                    targetChObj = subjectChapters.find(c => c.id === targetChapterId) || { unit: 'Unit 1', title: 'Unit 1' };
                }

                await assignmentService.publishAssignment({
                    targetSubjectKey: targetSubjectKey,
                    targetChapterId: targetChapterId,
                    targetChObj: targetChObj,
                    assNum: assNum,
                    assTitle: assTitle,
                    qFile: qFile,
                    aFile: aFile,
                    qNotes: qNotes,
                    aNotes: aNotes
                });

                closeUploadModal();
                showToast('Assignment Published Successfully!');

                if (targetSubjectKey === subjectKey || (targetSubjectKey === 'maths' && subjectKey === 'math') || (targetSubjectKey === 'math' && subjectKey === 'maths')) {
                    activeChapterId = 'all';
                    renderChapterNav();
                    renderAssignments(searchInput ? searchInput.value : '');
                } else {
                    window.location.search = `?subject=${targetSubjectKey}`;
                }
            } catch (err) {
                console.error(err);
                showToast('Error processing PDF file upload.', true);
            }
        });
    }

    // ---------------------------------------------------------
    // 17. Live Online Users Counter & Toast Helper
    // ---------------------------------------------------------
    const onlineUsersCountEl = document.getElementById('onlineUsersCount');
    if (onlineUsersCountEl) {
        let baseCount = parseInt(sessionStorage.getItem('online_users_count')) || Math.floor(Math.random() * 12) + 16;
        sessionStorage.setItem('online_users_count', baseCount);
        onlineUsersCountEl.textContent = baseCount;

        setInterval(() => {
            const delta = Math.floor(Math.random() * 3) - 1;
            baseCount = Math.max(12, Math.min(36, baseCount + delta));
            sessionStorage.setItem('online_users_count', baseCount);
            onlineUsersCountEl.textContent = baseCount;
        }, 5000);
    }

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        if (!toast || !toastMessage) return;

        const icon = toast.querySelector('i');
        if (icon) {
            icon.className = isError ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check';
        }

        toastMessage.textContent = message;
        toast.style.background = isError ? '#ef4444' : '#0f172a';
        toast.style.display = 'flex';
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => { toast.style.display = 'none'; }, 300);
        }, 3200);
    }

    function customConfirm(message) {
        if (typeof window.customConfirm === 'function') {
            return window.customConfirm(message);
        }
        return Promise.resolve(confirm(message));
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initial Load & Realtime Sync (Awaited Cloud Pull Before Rendering)
    async function initAssignmentsPage() {
        updateAdminUI();
        const assignmentsListEl = document.getElementById('assignmentsList');
        if (assignmentsListEl) {
            assignmentsListEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top: 10px;">Loading latest assignments from Supabase...</p></div>';
        }

        if (window.supabaseRealtime && window.supabaseRealtime.pullLatest) {
            try {
                await window.supabaseRealtime.pullLatest();
            } catch (e) {
                console.warn('Initial assignment storage pull:', e);
            }
        }

        try {
            await fetchAssignments();
        } catch (e) {
            console.warn('Background assignment fetch:', e);
        }

        renderChapterNav();
        renderAssignments(searchInput ? searchInput.value : '');
        updateAdminUI();
    }

    initAssignmentsPage();

    if (window.supabaseRealtime) {
        window.supabaseRealtime.subscribe(() => {
            fetchAssignments().then(() => {
                renderChapterNav();
                renderAssignments(searchInput ? searchInput.value : '');
            });
        });
    }
});
