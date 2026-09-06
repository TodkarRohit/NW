// Engineering Notes Hub - Home Page & Subject Management Script

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const searchCounter = document.getElementById('searchCounter');
    const subjectsContainer = document.getElementById('subjectsContainer');
    const branchUnavailableMessage = document.getElementById('branchUnavailableMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const addSubjectBtn = document.getElementById('addSubjectBtn');

    // Modals
    const subjectModalBackdrop = document.getElementById('subjectModalBackdrop');
    const closeSubjectModalBtn = document.getElementById('closeSubjectModalBtn');
    const cancelSubjectModalBtn = document.getElementById('cancelSubjectModalBtn');
    const subjectForm = document.getElementById('subjectForm');
    const subjectModalTitle = document.getElementById('subjectModalTitle');
    const subjectModalEditId = document.getElementById('subjectModalEditId');
    const subjectTitleInput = document.getElementById('subjectTitleInput');
    const subjectCodeInput = document.getElementById('subjectCodeInput');
    const subjectSemSelect = document.getElementById('subjectSemSelect');
    const branchCheckboxes = document.querySelectorAll('.branch-checkbox');

    // Confirm Modal
    const confirmModalBackdrop = document.getElementById('confirmModalBackdrop');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    function customConfirm(message) {
        return new Promise((resolve) => {
            if (!confirmModalBackdrop || !confirmModalMessage || !confirmOkBtn || !confirmCancelBtn) {
                resolve(confirm(message));
                return;
            }
            confirmModalMessage.textContent = message;
            confirmModalBackdrop.style.display = 'flex';

            const cleanup = () => {
                confirmModalBackdrop.style.display = 'none';
                confirmOkBtn.removeEventListener('click', onOk);
                confirmCancelBtn.removeEventListener('click', onCancel);
            };

            const onOk = () => { cleanup(); resolve(true); };
            const onCancel = () => { cleanup(); resolve(false); };

            confirmOkBtn.addEventListener('click', onOk);
            confirmCancelBtn.addEventListener('click', onCancel);
        });
    }

    function checkAdminState() {
        const user = window.authService ? window.authService.getUser() : null;
        const uname = user ? String(user.username || '').toLowerCase() : '';
        const uemail = user ? String(user.email || '').toLowerCase() : '';
        const isAdmin = (
            localStorage.getItem('isAdminMode') === 'true' ||
            (user && (user.is_admin === true || user.is_admin === 'true' || user.role === 'admin' || uname === 'rohittodkar92' || uname === 'admin' || uname.includes('rohittodkar') || uemail.includes('rohittodkar')))
        );

        if (addSubjectBtn) {
            addSubjectBtn.style.display = isAdmin ? 'inline-flex' : 'none';
        }
        return isAdmin;
    }

    function getActiveBranch() {
        const activeItem = document.querySelector('.branch-item.active');
        return activeItem ? activeItem.dataset.branch : (localStorage.getItem('user_branch') || 'CE');
    }

    // Dynamic Grid Renderer
    function renderSubjectsGrid(query = '') {
        if (!subjectsContainer) return;

        const activeBranch = getActiveBranch();
        const isAdmin = checkAdminState();
        const searchLower = query.toLowerCase().trim();

        // Reload data from localStorage
        if (typeof loadCustomSubjectsIntoData === 'function') {
            loadCustomSubjectsIntoData();
        }

        // Deduplicate subject objects (ignore aliases pointing to same object)
        const uniqueSubjects = [];
        const seenObjects = new Set();

        for (const key in subjectsData) {
            const subj = subjectsData[key];
            if (subj && !seenObjects.has(subj)) {
                seenObjects.add(subj);
                uniqueSubjects.push(subj);
            }
        }

        // Filter by branch
        const branchSubjects = uniqueSubjects.filter(subj => {
            const branches = subj.branches || ['ALL'];
            return branches.includes('ALL') || branches.includes(activeBranch);
        });

        // Filter by search query
        let visibleSubjects = branchSubjects;
        if (searchLower.length > 0) {
            visibleSubjects = branchSubjects.filter(subj => {
                const titleMatch = (subj.title || '').toLowerCase().includes(searchLower);
                const semMatch = (subj.semester || '').toLowerCase().includes(searchLower);
                const idMatch = (subj.id || '').toLowerCase().includes(searchLower);
                
                let chapterMatch = false;
                if (subj.chapters) {
                    chapterMatch = subj.chapters.some(c => (c.title && c.title.toLowerCase().includes(searchLower)) || (c.name && c.name.toLowerCase().includes(searchLower)));
                }

                return titleMatch || semMatch || idMatch || chapterMatch;
            });
        }

        // Search counter UI
        if (searchCounter) {
            if (searchLower.length > 0) {
                searchCounter.style.display = 'inline-block';
                searchCounter.innerHTML = `<i class="fa-solid fa-filter"></i> Found <strong>${visibleSubjects.length}</strong> matching subject${visibleSubjects.length === 1 ? '' : 's'} for "<em>${escapeHTML(searchLower)}</em>"`;
            } else {
                searchCounter.style.display = 'none';
            }
        }

        if (searchClearBtn) {
            searchClearBtn.style.display = searchLower.length > 0 ? 'flex' : 'none';
        }

        // Handle empty branch or empty search results
        if (branchSubjects.length === 0) {
            subjectsContainer.style.display = 'none';
            if (branchUnavailableMessage) branchUnavailableMessage.style.display = 'block';
            if (noResultsMessage) noResultsMessage.style.display = 'none';
            return;
        } else {
            if (branchUnavailableMessage) branchUnavailableMessage.style.display = 'none';
        }

        if (visibleSubjects.length === 0) {
            subjectsContainer.style.display = 'none';
            if (noResultsMessage) noResultsMessage.style.display = 'block';
            return;
        } else {
            subjectsContainer.style.display = 'grid';
            if (noResultsMessage) noResultsMessage.style.display = 'none';
        }

        // Render HTML for matching subjects
        subjectsContainer.innerHTML = visibleSubjects.map(subj => {
            const branchesDisplay = (subj.branches || ['ALL']).join(', ');
            return `
                <div class="subject-card" data-subject="${subj.id}">
                    <div class="card-header" style="position: relative; padding-right: 70px;">
                        <h2>${escapeHTML(subj.title)}</h2>
                        <div style="display: flex; gap: 6px; align-items: center; margin-top: 6px; flex-wrap: wrap;">
                            <span class="semester-tag">${escapeHTML(subj.semester || 'Semester 2')}</span>
                            <span class="semester-tag" style="background: rgba(14, 165, 233, 0.15); color: #0ea5e9;">${escapeHTML(branchesDisplay)}</span>
                        </div>
                        ${isAdmin ? `
                            <div class="card-admin-actions" style="position: absolute; top: 12px; right: 12px; display: flex; gap: 6px;">
                                <button type="button" class="edit-subject-btn" data-id="${subj.id}" style="background: rgba(14, 165, 233, 0.1); border: none; color: #0ea5e9; padding: 6px 8px; border-radius: 6px; cursor: pointer;" title="Edit Subject">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button type="button" class="delete-subject-btn" data-id="${subj.id}" style="background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; padding: 6px 8px; border-radius: 6px; cursor: pointer;" title="Delete Subject">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="resource-links">
                        <a href="../notes/viewer.html?subject=${subj.id}&type=notes" class="btn btn-notes">
                            <i class="fa-solid fa-book-open"></i> Study Notes
                        </a>
                        <a href="../question_bank/viewer.html?subject=${subj.id}&type=qb" class="btn btn-qb">
                            <i class="fa-solid fa-circle-question"></i> Question Banks
                        </a>
                        <a href="../assignments/assignments.html?subject=${subj.id}" class="btn btn-assignments">
                            <i class="fa-solid fa-folder-open"></i> Assignments
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        // Attach Edit & Delete Listeners
        if (isAdmin) {
            document.querySelectorAll('.edit-subject-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const sId = btn.dataset.id;
                    openSubjectModal(sId);
                });
            });

            document.querySelectorAll('.delete-subject-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const sId = btn.dataset.id;
                    const subj = subjectsData[sId];
                    const title = subj ? subj.title : sId;

                    if (await customConfirm(`Are you sure you want to delete "${title}"?`)) {
                        // Mark as deleted in localStorage
                        let deletedSubjects = [];
                        try {
                            deletedSubjects = JSON.parse(localStorage.getItem('deleted_subjects_list')) || [];
                        } catch (e) {}
                        if (!deletedSubjects.includes(sId)) {
                            deletedSubjects.push(sId);
                        }
                        localStorage.setItem('deleted_subjects_list', JSON.stringify(deletedSubjects));

                        // If it's a custom subject, remove from custom list
                        let customSubjects = [];
                        try {
                            customSubjects = JSON.parse(localStorage.getItem('custom_subjects_list')) || [];
                            customSubjects = customSubjects.filter(s => s.id !== sId);
                            localStorage.setItem('custom_subjects_list', JSON.stringify(customSubjects));
                        } catch (e) {}

                        delete subjectsData[sId];

                        showToast(`Subject "${title}" deleted.`);
                        renderSubjectsGrid(searchInput ? searchInput.value : '');
                        await autoPublishState();
                    }
                });
            });
        }
    }

    // Subject Modal Handlers
    function openSubjectModal(editId = null) {
        if (!subjectModalBackdrop) return;

        subjectModalEditId.value = editId || '';
        if (editId && subjectsData[editId]) {
            const subj = subjectsData[editId];
            subjectModalTitle.textContent = 'Edit Subject';
            subjectTitleInput.value = subj.title || '';
            subjectCodeInput.value = subj.id || '';
            subjectCodeInput.disabled = true; // Code key is fixed for edits
            subjectSemSelect.value = subj.semester || 'Semester 2';

            const selectedBranches = subj.branches || ['ALL'];
            branchCheckboxes.forEach(cb => {
                cb.checked = selectedBranches.includes(cb.value);
            });
        } else {
            subjectModalTitle.textContent = 'Add New Subject';
            subjectForm.reset();
            subjectCodeInput.disabled = false;
            branchCheckboxes.forEach(cb => {
                cb.checked = (cb.value === 'ALL');
            });
        }

        subjectModalBackdrop.style.display = 'flex';
    }

    function closeSubjectModal() {
        if (subjectModalBackdrop) {
            subjectModalBackdrop.style.display = 'none';
        }
    }

    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', () => openSubjectModal(null));
    }
    if (closeSubjectModalBtn) closeSubjectModalBtn.addEventListener('click', closeSubjectModal);
    if (cancelSubjectModalBtn) cancelSubjectModalBtn.addEventListener('click', closeSubjectModal);

    if (subjectForm) {
        subjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const editId = subjectModalEditId.value;
            const title = subjectTitleInput.value.trim();
            const code = subjectCodeInput.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
            const semester = subjectSemSelect.value;

            const selectedBranches = [];
            branchCheckboxes.forEach(cb => {
                if (cb.checked) selectedBranches.push(cb.value);
            });

            if (selectedBranches.length === 0) {
                alert('Please select at least one branch or "ALL Branches".');
                return;
            }

            if (!code) {
                alert('Please enter a valid subject code.');
                return;
            }

            let subjObj = editId ? subjectsData[editId] : null;

            if (!subjObj) {
                // Initializing brand new subject
                subjObj = {
                    id: code,
                    title: title,
                    semester: semester,
                    branches: selectedBranches,
                    typeName: "Study Notes",
                    chapters: [
                        { id: `${code}-u1`, title: "Unit 1: Fundamentals & Core Concepts", unit: "Unit 1", name: "Fundamentals & Core Concepts" },
                        { id: `${code}-u2`, title: "Unit 2: Advanced Topics & Operations", unit: "Unit 2", name: "Advanced Topics & Operations" },
                        { id: `${code}-u3`, title: "Unit 3: Applications & Case Studies", unit: "Unit 3", name: "Applications & Case Studies" },
                        { id: `${code}-u4`, title: "Unit 4: System Implementation & Review", unit: "Unit 4", name: "System Implementation & Review" }
                    ],
                    questionBanks: [
                        { id: `${code}-qb1`, title: "Unit 1 Question Bank: Fundamentals", unit: "Unit 1", name: "Fundamentals Question Bank" },
                        { id: `${code}-qb2`, title: "Unit 2 Question Bank: Advanced Topics", unit: "Unit 2", name: "Advanced Topics Question Bank" },
                        { id: `${code}-qb3`, title: "Unit 3 Question Bank: Applications", unit: "Unit 3", name: "Applications Question Bank" },
                        { id: `${code}-qb4`, title: "Unit 4 Question Bank: Implementation", unit: "Unit 4", name: "Implementation Question Bank" }
                    ]
                };

                let customSubjects = [];
                try {
                    customSubjects = JSON.parse(localStorage.getItem('custom_subjects_list')) || [];
                } catch (e) {}
                customSubjects.push(subjObj);
                localStorage.setItem('custom_subjects_list', JSON.stringify(customSubjects));
            } else {
                // Editing existing subject
                subjObj.title = title;
                subjObj.semester = semester;
                subjObj.branches = selectedBranches;

                let modifiedSubjects = {};
                try {
                    modifiedSubjects = JSON.parse(localStorage.getItem('modified_subjects_data')) || {};
                } catch (e) {}
                modifiedSubjects[editId] = { title, semester, branches: selectedBranches };
                localStorage.setItem('modified_subjects_data', JSON.stringify(modifiedSubjects));
            }

            subjectsData[code] = subjObj;
            closeSubjectModal();
            showToast(`Subject "${title}" saved successfully!`);
            renderSubjectsGrid(searchInput ? searchInput.value : '');

            await autoPublishState();
        });
    }

    // Auto Publish State to Supabase
    async function autoPublishState() {
        const isAdmin = checkAdminState();
        if (!isAdmin || !window.supabaseClient) return;

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
                key.startsWith('deleted_subjects_')
            ) {
                exportData[key] = localStorage.getItem(key);
            }
        }

        const jsonString = JSON.stringify(exportData);
        const blob = new Blob([jsonString], { type: 'application/json' });

        try {
            await window.supabaseClient.storage.from('academic-files').upload('published_state/app_data.json', blob, { contentType: 'application/json', upsert: true });
        } catch (err) {
            console.error('Auto publish error:', err);
        }
    }

    // Search Input Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => renderSubjectsGrid(e.target.value));

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            } else if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                renderSubjectsGrid('');
                searchInput.blur();
            }
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                renderSubjectsGrid('');
                searchInput.focus();
            }
        });
    }

    function escapeHTML(str) {
        return (str || '').replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Theme Management
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

    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#themeToggleBtn')) {
            const activeTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', activeTheme);
            applyTheme(activeTheme);
        }
    });

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

    // Sidebar Toggle for Mobile
    const homeSidebarToggle = document.getElementById('homeSidebarToggle');
    const homeSidebar = document.getElementById('homeSidebar');

    if (homeSidebarToggle && homeSidebar) {
        homeSidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            homeSidebar.classList.toggle('active');
            homeSidebar.classList.toggle('collapsed');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900 && homeSidebar.classList.contains('active')) {
                if (!homeSidebar.contains(e.target) && e.target !== homeSidebarToggle) {
                    homeSidebar.classList.remove('active');
                    homeSidebar.classList.add('collapsed');
                }
            }
        });
    }

    // Branch selection listeners
    const branchItems = document.querySelectorAll('.branch-item');
    if (branchItems.length > 0) {
        const savedBranch = localStorage.getItem('user_branch');
        if (savedBranch) {
            branchItems.forEach(item => {
                if (item.dataset.branch === savedBranch) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        branchItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                branchItems.forEach(b => b.classList.remove('active'));
                item.classList.add('active');
                const branchName = item.dataset.branch;

                showToast(`Switched to ${item.textContent.trim()} Branch`);
                localStorage.setItem('user_branch', branchName);
                renderSubjectsGrid(searchInput ? searchInput.value : '');
            });
        });
    }

    // Initial Load & Cloud Sync
    async function init() {
        if (window.supabaseClient) {
            try {
                const { data: urlData } = window.supabaseClient.storage.from('academic-files').getPublicUrl('published_state/app_data.json');
                const res = await fetch(urlData.publicUrl + '?t=' + Date.now());
                if (res.ok) {
                    const publishedData = await res.json();
                    for (const key in publishedData) {
                        localStorage.setItem(key, publishedData[key]);
                    }
                }
            } catch (e) {
                console.warn('Cloud sync error on home init:', e);
            }
        }

        renderSubjectsGrid();
    }

    init();
});
