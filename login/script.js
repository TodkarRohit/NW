// Engineering Notes Hub - Home Page & Subject Management Script

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const searchCounter = document.getElementById('searchCounter');
    const subjectsContainer = document.getElementById('subjectsContainer');
    const branchUnavailableMessage = document.getElementById('branchUnavailableMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const addSubjectBtn = document.getElementById('addSubjectBtn');

    // Sidebar & Branch Management Elements
    const homeBranchList = document.getElementById('homeBranchList');
    const addBranchBtn = document.getElementById('addBranchBtn');
    const branchModalBackdrop = document.getElementById('branchModalBackdrop');
    const closeBranchModalBtn = document.getElementById('closeBranchModalBtn');
    const cancelBranchModalBtn = document.getElementById('cancelBranchModalBtn');
    const branchForm = document.getElementById('branchForm');
    const branchModalTitle = document.getElementById('branchModalTitle');
    const branchModalEditCode = document.getElementById('branchModalEditCode');
    const branchCodeInput = document.getElementById('branchCodeInput');
    const branchNameInput = document.getElementById('branchNameInput');

    // Admin Empty Branch Box Elements
    const adminAddBranchSubjectBox = document.getElementById('adminAddBranchSubjectBox');
    const emptyBranchAddSubjectBtn = document.getElementById('emptyBranchAddSubjectBtn');
    const emptyBranchName = document.getElementById('emptyBranchName');

    // Subject Modal Elements
    const subjectModalBackdrop = document.getElementById('subjectModalBackdrop');
    const closeSubjectModalBtn = document.getElementById('closeSubjectModalBtn');
    const cancelSubjectModalBtn = document.getElementById('cancelSubjectModalBtn');
    const subjectForm = document.getElementById('subjectForm');
    const subjectModalTitle = document.getElementById('subjectModalTitle');
    const subjectModalEditId = document.getElementById('subjectModalEditId');
    const subjectTitleInput = document.getElementById('subjectTitleInput');
    const subjectCodeInput = document.getElementById('subjectCodeInput');
    const subjectSemSelect = document.getElementById('subjectSemSelect');
    const branchCheckboxesContainer = document.querySelector('.branch-checkbox')?.closest('div');

    // Resource Modules & Custom Links Elements
    const resNotesCheckbox = document.getElementById('resNotesCheckbox');
    const resQbCheckbox = document.getElementById('resQbCheckbox');
    const resAssCheckbox = document.getElementById('resAssCheckbox');
    const addCustomLinkBtn = document.getElementById('addCustomLinkBtn');
    const customLinksContainer = document.getElementById('customLinksContainer');

    // General Confirm Modal
    const confirmModalBackdrop = document.getElementById('confirmModalBackdrop');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    // Subject Delete Options Modal
    const subjectDeleteOptionsModal = document.getElementById('subjectDeleteOptionsModal');
    const subjectDeleteModalSubtext = document.getElementById('subjectDeleteModalSubtext');
    const deleteActiveBranchName = document.getElementById('deleteActiveBranchName');
    const deleteCurrentBranchOnlyBtn = document.getElementById('deleteCurrentBranchOnlyBtn');
    const deleteGlobalSubjectBtn = document.getElementById('deleteGlobalSubjectBtn');
    const cancelDeleteOptionsBtn = document.getElementById('cancelDeleteOptionsBtn');

    function customConfirm(message) {
        if (typeof window.customConfirm === 'function') {
            return window.customConfirm(message);
        }
        return Promise.resolve(confirm(message));
    }

    const publishStateBtn = document.getElementById('publishStateBtn');

    function checkAdminState() {
        const user = window.authService ? window.authService.getUser() : null;
        const uname = user ? String(user.username || '').toLowerCase() : '';
        const uemail = user ? String(user.email || '').toLowerCase() : '';
        const isAdmin = (
            localStorage.getItem('isAdminMode') === 'true' ||
            (user && (user.is_admin === true || user.is_admin === 'true' || user.role === 'admin' || uname === 'rohittodkar92' || uname === 'admin' || uname.includes('rohittodkar') || uemail.includes('rohittodkar')))
        );

        if (addSubjectBtn) addSubjectBtn.style.display = isAdmin ? 'inline-flex' : 'none';
        if (addBranchBtn) addBranchBtn.style.display = isAdmin ? 'inline-flex' : 'none';
        if (publishStateBtn) publishStateBtn.style.display = isAdmin ? 'inline-flex' : 'none';

        return isAdmin;
    }

    if (publishStateBtn) {
        publishStateBtn.addEventListener('click', async () => {
            publishStateBtn.disabled = true;
            const originalHTML = publishStateBtn.innerHTML;
            publishStateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Publishing...</span>';
            showToast('Syncing changes & cleaning Cloud storage...');

            try {
                if (!window.supabaseRealtime || typeof window.supabaseRealtime.pushAndBroadcast !== 'function') {
                    throw new Error('Supabase sync service is unavailable.');
                }
                if (window.supabaseRealtime.cleanOrphans) {
                    await window.supabaseRealtime.cleanOrphans();
                }
                const success = await window.supabaseRealtime.pushAndBroadcast();
                if (success) {
                    localStorage.setItem('hasUnpublishedChanges', 'false');
                    if (typeof window.updateUnpublishedBanner === 'function') {
                        window.updateUnpublishedBanner();
                    }
                    showToast('Published all changes live to Supabase Cloud!');
                    if (typeof renderSubjectsGrid === 'function') {
                        renderSubjectsGrid(searchInput ? searchInput.value : '');
                    }
                } else {
                    showToast('Publish failed: Could not update Supabase cloud storage.', true);
                }
            } catch (err) {
                console.error('Publish error:', err);
                showToast('Failed to publish changes: ' + (err.message || 'Error'), true);
            } finally {
                publishStateBtn.disabled = false;
                publishStateBtn.innerHTML = originalHTML;
            }
        });
    }

    class BranchManager {
        getActiveBranch() {
            const activeItem = document.querySelector('.branch-item.active');
            return activeItem ? activeItem.dataset.branch : (localStorage.getItem('user_branch') || 'CE');
        }

        renderSidebar() {
            if (!homeBranchList) return;

            const isAdmin = checkAdminState();
            const availableBranches = typeof window.getAvailableBranches === 'function' 
                ? window.getAvailableBranches() 
                : [{ code: 'CE', name: 'CE' }, { code: 'CSE', name: 'CSE' }, { code: 'IT', name: 'IT' }, { code: 'ECE', name: 'ECE' }, { code: 'AIDS', name: 'AI DS' }];

            let activeBranch = localStorage.getItem('user_branch');
            if (!activeBranch || !availableBranches.some(b => b.code === activeBranch)) {
                activeBranch = availableBranches[0] ? availableBranches[0].code : 'CE';
                localStorage.setItem('user_branch', activeBranch);
            }

            homeBranchList.innerHTML = availableBranches.map(b => `
                <li style="position: relative; display: flex; align-items: center; justify-content: space-between;">
                    <a href="#" class="branch-item ${b.code === activeBranch ? 'active' : ''}" data-branch="${b.code}" style="flex: 1;">
                        ${escapeHTML(b.name)}
                    </a>
                    ${isAdmin ? `
                        <div class="branch-admin-actions" style="display: flex; gap: 4px; padding-right: 6px;">
                            <button type="button" class="edit-branch-btn" data-code="${b.code}" style="background: transparent; border: none; color: #0ea5e9; cursor: pointer; padding: 4px;" title="Edit Branch">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button type="button" class="delete-branch-btn" data-code="${b.code}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Delete Branch">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </li>
            `).join('');

            document.querySelectorAll('.branch-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('.branch-item').forEach(b => b.classList.remove('active'));
                    item.classList.add('active');
                    const branchName = item.dataset.branch;

                    showToast(`Switched to ${item.textContent.trim()} Branch`);
                    localStorage.setItem('user_branch', branchName);
                    renderSubjectsGrid(searchInput ? searchInput.value : '');
                });
            });

            if (isAdmin) {
                document.querySelectorAll('.edit-branch-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        branchService.openModal(btn.dataset.code);
                    });
                });

                document.querySelectorAll('.delete-branch-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const bCode = btn.dataset.code;
                        const bObj = availableBranches.find(b => b.code === bCode);
                        const bName = bObj ? bObj.name : bCode;

                        if (await customConfirm(`Are you sure you want to delete branch "${bName}"?`)) {
                            branchService.deleteBranch(bCode, bName);
                        }
                    });
                });
            }
        }

        openModal(editCode = null) {
            if (!branchModalBackdrop) return;

            branchModalEditCode.value = editCode || '';
            const availableBranches = typeof window.getAvailableBranches === 'function' ? window.getAvailableBranches() : [];

            if (editCode) {
                const bObj = availableBranches.find(b => b.code === editCode);
                branchModalTitle.textContent = 'Edit Branch';
                branchCodeInput.value = editCode;
                branchCodeInput.disabled = true;
                branchNameInput.value = bObj ? bObj.name : editCode;
            } else {
                branchModalTitle.textContent = 'Add New Branch';
                branchForm.reset();
                branchCodeInput.disabled = false;
            }

            branchModalBackdrop.style.display = 'flex';
        }

        closeModal() {
            if (branchModalBackdrop) branchModalBackdrop.style.display = 'none';
        }

        async deleteBranch(bCode, bName) {
            let deletedBranches = [];
            try {
                deletedBranches = JSON.parse(localStorage.getItem('deleted_branches_list')) || [];
            } catch (err) {}
            if (!deletedBranches.includes(bCode)) {
                deletedBranches.push(bCode);
            }
            localStorage.setItem('deleted_branches_list', JSON.stringify(deletedBranches));

            let customBranches = [];
            try {
                customBranches = JSON.parse(localStorage.getItem('custom_branches_list')) || [];
                customBranches = customBranches.filter(b => b.code !== bCode);
                localStorage.setItem('custom_branches_list', JSON.stringify(customBranches));
            } catch (err) {}

            if (this.getActiveBranch() === bCode) {
                localStorage.setItem('user_branch', 'CE');
            }

            showToast(`Branch "${bName}" deleted.`);
            this.renderSidebar();
            renderSubjectsGrid(searchInput ? searchInput.value : '');
            await autoPublishState();
        }

        async saveBranch(code, name, editCode) {
            if (!editCode) {
                let customBranches = [];
                try {
                    customBranches = JSON.parse(localStorage.getItem('custom_branches_list')) || [];
                } catch (err) {}

                customBranches.push({ code, name });
                localStorage.setItem('custom_branches_list', JSON.stringify(customBranches));
            } else {
                let modifiedBranches = {};
                try {
                    modifiedBranches = JSON.parse(localStorage.getItem('modified_branches_data')) || {};
                } catch (err) {}

                modifiedBranches[editCode] = { name };
                localStorage.setItem('modified_branches_data', JSON.stringify(modifiedBranches));
            }

            this.closeModal();
            showToast(`Branch "${name}" saved successfully!`);
            this.renderSidebar();
            renderSubjectsGrid(searchInput ? searchInput.value : '');
            await autoPublishState();
        }
    }

    const branchService = new BranchManager();

    function getActiveBranch() {
        return branchService.getActiveBranch();
    }

    function renderBranchesSidebar() {
        branchService.renderSidebar();
    }

    if (addBranchBtn) addBranchBtn.addEventListener('click', () => branchService.openModal(null));
    if (closeBranchModalBtn) closeBranchModalBtn.addEventListener('click', () => branchService.closeModal());
    if (cancelBranchModalBtn) cancelBranchModalBtn.addEventListener('click', () => branchService.closeModal());

    if (branchForm) {
        branchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editCode = branchModalEditCode.value;
            const code = branchCodeInput.value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
            const name = branchNameInput.value.trim();

            if (!code || !name) {
                alert('Please enter both branch code and name.');
                return;
            }

            await branchService.saveBranch(code, name, editCode);
        });
    }

// SubjectCard OOP Class Definition
class SubjectCard {
    constructor(subj) {
        this.id = subj.id || subj.code || '';
        this.title = subj.title || '';
        this.semester = subj.semester || 'Semester 2';
        this.branches = subj.branches || ['ALL'];
        this.resources = subj.resources || { notes: true, qb: true, assignments: true };
        this.customLinks = subj.customLinks || [];
        this.chapters = subj.chapters || [
            { id: `${subj.id}-u1`, title: "Unit 1: Fundamentals & Core Concepts", unit: "Unit 1", name: "Fundamentals & Core Concepts" },
            { id: `${subj.id}-u2`, title: "Unit 2: Advanced Topics & Operations", unit: "Unit 2", name: "Advanced Topics & Operations" },
            { id: `${subj.id}-u3`, title: "Unit 3: Applications & Case Studies", unit: "Unit 3", name: "Applications & Case Studies" },
            { id: `${subj.id}-u4`, title: "Unit 4: System Implementation & Review", unit: "Unit 4", name: "System Implementation & Review" }
        ];
        this.questionBanks = subj.questionBanks || [
            { id: `${subj.id}-qb1`, title: "Unit 1 Question Bank: Fundamentals", unit: "Unit 1", name: "Fundamentals Question Bank" },
            { id: `${subj.id}-qb2`, title: "Unit 2 Question Bank: Advanced Topics", unit: "Unit 2", name: "Advanced Topics Question Bank" },
            { id: `${subj.id}-qb3`, title: "Unit 3 Question Bank: Applications", unit: "Unit 3", name: "Applications Question Bank" },
            { id: `${subj.id}-qb4`, title: "Unit 4 Question Bank: Implementation", unit: "Unit 4", name: "Implementation Question Bank" }
        ];
        this.assignments = subj.assignments || [];
    }

    render(isAdmin = false) {
        const branchesDisplay = (this.branches || ['ALL']).join(', ');
        const res = this.resources || { notes: true, qb: true, assignments: true };
        const customLinks = this.customLinks || [];

        let resourceLinksHTML = '';

        const notesUrl = typeof NavigationManager !== 'undefined' ? NavigationManager.getNotesUrl(this.id) : `../notes/viewer.html?subject=${this.id}&type=notes`;
        const qbUrl = typeof NavigationManager !== 'undefined' ? NavigationManager.getQuestionBankUrl(this.id) : `../question_bank/viewer.html?subject=${this.id}&type=qb`;
        const assUrl = typeof NavigationManager !== 'undefined' ? NavigationManager.getAssignmentsUrl(this.id) : `../assignments/assignments.html?subject=${this.id}`;

        function isResEnabled(val) {
            return val !== false && val !== 'false' && val !== 0 && val !== '0' && val !== undefined;
        }

        const isNotesEnabled = isResEnabled(res.notes);
        const isQbEnabled = isResEnabled(res.qb);
        const isAssEnabled = isResEnabled(res.assignments);

        if (isNotesEnabled) {
            resourceLinksHTML += `
                <a href="${notesUrl}" class="btn btn-notes">
                    <i class="fa-solid fa-book-open"></i> Study Notes
                </a>
            `;
        }
        if (isQbEnabled) {
            resourceLinksHTML += `
                <a href="${qbUrl}" class="btn btn-qb">
                    <i class="fa-solid fa-circle-question"></i> Question Banks
                </a>
            `;
        }
        if (isAssEnabled) {
            resourceLinksHTML += `
                <a href="${assUrl}" class="btn btn-assignments">
                    <i class="fa-solid fa-folder-open"></i> Assignments
                </a>
            `;
        }

        customLinks.forEach(link => {
            if (link && link.title && link.url) {
                resourceLinksHTML += `
                    <a href="${escapeHTML(link.url)}" target="_blank" class="btn btn-notes" style="background: rgba(14, 165, 233, 0.1); color: #0ea5e9; border: 1px solid rgba(14, 165, 233, 0.3);">
                        <i class="${escapeHTML(link.icon || 'fa-solid fa-link')}"></i> ${escapeHTML(link.title)}
                    </a>
                `;
            }
        });

        return `
            <div class="subject-card" data-subject="${this.id}">
                <div class="card-header" style="position: relative; padding-right: 70px;">
                    <h2>${escapeHTML(this.title)}</h2>
                    <div style="display: flex; gap: 6px; align-items: center; margin-top: 6px; flex-wrap: wrap;">
                        <span class="semester-tag">${escapeHTML(this.semester || 'Semester 2')}</span>
                        <span class="semester-tag" style="background: rgba(14, 165, 233, 0.15); color: #0ea5e9;">${escapeHTML(branchesDisplay)}</span>
                    </div>
                    ${isAdmin ? `
                        <div class="card-admin-actions" style="position: absolute; top: 12px; right: 12px; display: flex; gap: 6px;">
                            <button type="button" class="edit-subject-btn" data-id="${this.id}" style="background: rgba(14, 165, 233, 0.1); border: none; color: #0ea5e9; padding: 6px 8px; border-radius: 6px; cursor: pointer;" title="Edit Subject">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button type="button" class="delete-subject-btn" data-id="${this.id}" style="background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; padding: 6px 8px; border-radius: 6px; cursor: pointer;" title="Delete Subject">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="resource-links">
                    ${resourceLinksHTML}
                </div>
            </div>
        `;
    }

    // Instance method: Save subject card into LocalStorage and push to Supabase Cloud Storage
    async save(editId = null) {
        const targetId = (editId && typeof editId === 'string' && editId.trim()) ? editId.trim() : this.id;
        const normCode = targetId.replace(/_/g, '-');
        const altCode = targetId.replace(/-/g, '_');
        const thisNormCode = this.id.replace(/_/g, '-');
        const thisAltCode = this.id.replace(/-/g, '_');

        // 1. Clear ALL tombstone records for this subject ID, targetId, aliases, and title across storage & DB
        if (typeof window.removeSubjectFromDeletedTombstones === 'function') {
            window.removeSubjectFromDeletedTombstones(this.id);
            window.removeSubjectFromDeletedTombstones(targetId);
            window.removeSubjectFromDeletedTombstones(normCode);
            window.removeSubjectFromDeletedTombstones(altCode);
            if (this.title) window.removeSubjectFromDeletedTombstones(this.title);
        }

        // 2. Prepare payload object
        const subjObj = {
            id: this.id,
            title: this.title,
            semester: this.semester,
            branches: this.branches,
            resources: this.resources,
            customLinks: this.customLinks,
            typeName: "Study Notes",
            chapters: this.chapters,
            questionBanks: this.questionBanks,
            assignments: this.assignments
        };

        // 3. Update subjectsData in memory (including alias keys)
        const allKeys = Array.from(new Set([this.id, targetId, normCode, altCode, thisNormCode, thisAltCode].filter(Boolean)));
        allKeys.forEach(k => {
            subjectsData[k] = subjObj;
        });
        if (this.id === 'math' || this.id === 'maths') {
            subjectsData['math'] = subjObj;
            subjectsData['maths'] = subjObj;
        }
        if (this.id === 'coa' || this.id === 'hardware') {
            subjectsData['coa'] = subjObj;
            subjectsData['hardware'] = subjObj;
        }

        // 4. Update custom_subjects_list in localStorage
        let customSubjects = [];
        try {
            customSubjects = JSON.parse(localStorage.getItem('custom_subjects_list')) || [];
        } catch (err) {}
        customSubjects = customSubjects.filter(s => 
            s && !allKeys.includes(s.id) && !allKeys.includes((s.id || '').replace(/_/g, '-'))
        );
        customSubjects.push(subjObj);
        localStorage.setItem('custom_subjects_list', JSON.stringify(customSubjects));

        // 5. Update modified_subjects_data in localStorage
        let modifiedSubjects = {};
        try {
            modifiedSubjects = JSON.parse(localStorage.getItem('modified_subjects_data')) || {};
        } catch (err) {}
        const modPayload = {
            id: this.id,
            title: this.title,
            semester: this.semester,
            branches: this.branches,
            resources: this.resources,
            customLinks: this.customLinks,
            chapters: this.chapters,
            questionBanks: this.questionBanks,
            assignments: this.assignments
        };
        allKeys.forEach(k => {
            modifiedSubjects[k] = modPayload;
        });
        if (this.id === 'math' || this.id === 'maths') {
            modifiedSubjects['math'] = modPayload;
            modifiedSubjects['maths'] = modPayload;
        }
        if (this.id === 'coa' || this.id === 'hardware') {
            modifiedSubjects['coa'] = modPayload;
            modifiedSubjects['hardware'] = modPayload;
        }
        localStorage.setItem('modified_subjects_data', JSON.stringify(modifiedSubjects));

        // 6. Reload in-memory structures & sync folders with Supabase Cloud Storage
        if (typeof window.loadCustomSubjectsIntoData === 'function') {
            window.loadCustomSubjectsIntoData();
        }

        if (window.supabaseRealtime) {
            if (editId && typeof editId === 'string' && editId.trim() && editId.trim() !== this.id && typeof window.supabaseRealtime.renameFolders === 'function') {
                await window.supabaseRealtime.renameFolders(editId.trim(), this.id);
            } else if (typeof window.supabaseRealtime.createFolders === 'function') {
                await window.supabaseRealtime.createFolders(this.id);
            }
        }

        try {
            const token = window.authService ? window.authService.getToken() : localStorage.getItem('enh_auth_token');
            const apiUrl = typeof window.getApiUrl === 'function' ? window.getApiUrl('/api/subjects/upsert') : '/api/subjects/upsert';
            const exportData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
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
                )) {
                    exportData[key] = localStorage.getItem(key);
                }
            }

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (token || '')
                },
                body: JSON.stringify({
                    subject: subjObj,
                    exportData: exportData
                })
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({ message: 'Backend upsert failed' }));
                console.warn('[SubjectCard] Backend upsert call failed:', errJson.message);
            }
        } catch (e) {
            console.warn('[SubjectCard] Backend upsert call error:', e);
        }

        await SubjectCard.pushToSupabase();
    }

    // Class method: Delete subject card globally from LocalStorage and push to Supabase Cloud Storage & Database
    static async deleteGlobally(sId, title = '') {
        let deletedSubjects = [];
        try {
            deletedSubjects = JSON.parse(localStorage.getItem('deleted_subjects_list')) || [];
        } catch (e) {}

        const normSId = sId.replace(/_/g, '-');
        const altSId = sId.replace(/-/g, '_');
        const targetTitleLower = (title || '').toLowerCase().trim();
        const targets = new Set([sId, normSId, altSId, sId.toLowerCase(), normSId.toLowerCase(), altSId.toLowerCase()]);

        if (targetTitleLower) targets.add(targetTitleLower);
        if (sId.toLowerCase() === 'maths' || sId.toLowerCase() === 'math') { targets.add('maths'); targets.add('math'); }
        if (sId.toLowerCase() === 'hardware' || sId.toLowerCase() === 'coa') { targets.add('hardware'); targets.add('coa'); }

        for (const k in subjectsData) {
            const s = subjectsData[k];
            if (s && s.title && s.title.toLowerCase().trim() === targetTitleLower) {
                if (s.id) {
                    targets.add(s.id);
                    targets.add(s.id.toLowerCase());
                }
                targets.add(k);
                targets.add(k.toLowerCase());
            }
        }

        try {
            let customSubjects = JSON.parse(localStorage.getItem('custom_subjects_list')) || [];
            customSubjects.forEach(s => {
                if (s) {
                    const sTitle = s.title ? s.title.toLowerCase().trim() : '';
                    if (sTitle === targetTitleLower || (s.id && targets.has(s.id.toLowerCase()))) {
                        if (s.id) {
                            targets.add(s.id);
                            targets.add(s.id.toLowerCase());
                        }
                    }
                }
            });
        } catch (e) {}

        const targetsArray = Array.from(targets).filter(Boolean);
        targetsArray.forEach(t => {
            if (t && !deletedSubjects.includes(t)) deletedSubjects.push(t);
            delete subjectsData[t];
        });

        localStorage.setItem('deleted_subjects_list', JSON.stringify(deletedSubjects));
        sessionStorage.setItem('deleted_subjects_list', JSON.stringify(deletedSubjects));
        localStorage.setItem('enh_permanent_deleted_subjects', JSON.stringify(deletedSubjects));

        // Thorough lowercased set for filtering
        const targetLowerSet = new Set(targetsArray.map(t => String(t).toLowerCase().trim()));

        // Filter out from custom_subjects_list
        try {
            let customSubjects = JSON.parse(localStorage.getItem('custom_subjects_list')) || [];
            customSubjects = customSubjects.filter(s => {
                if (!s) return false;
                const cId = String(s.id || s.code || '').toLowerCase().trim();
                const cTitle = String(s.title || '').toLowerCase().trim();
                const normId = cId.replace(/_/g, '-');
                const altId = cId.replace(/-/g, '_');
                return !targetLowerSet.has(cId) && !targetLowerSet.has(cTitle) && !targetLowerSet.has(normId) && !targetLowerSet.has(altId);
            });
            localStorage.setItem('custom_subjects_list', JSON.stringify(customSubjects));
        } catch (e) {}

        // Filter out from modified_subjects_data
        try {
            let modifiedSubjects = JSON.parse(localStorage.getItem('modified_subjects_data')) || {};
            for (const modKey in modifiedSubjects) {
                const modObj = modifiedSubjects[modKey];
                const kLower = String(modKey).toLowerCase().trim();
                const mTitle = modObj && modObj.title ? String(modObj.title).toLowerCase().trim() : '';
                const normK = kLower.replace(/_/g, '-');
                const altK = kLower.replace(/-/g, '_');
                if (targetLowerSet.has(kLower) || targetLowerSet.has(mTitle) || targetLowerSet.has(normK) || targetLowerSet.has(altK)) {
                    delete modifiedSubjects[modKey];
                }
            }
            localStorage.setItem('modified_subjects_data', JSON.stringify(modifiedSubjects));
        } catch (e) {}

        // 1. Direct Supabase Storage folder cleanup
        if (window.supabaseRealtime) {
            if (typeof window.supabaseRealtime.deleteSubjectFolders === 'function') {
                await window.supabaseRealtime.deleteSubjectFolders(sId);
            } else if (window.supabaseRealtime.deleteFolder) {
                await window.supabaseRealtime.deleteFolder(`notes/${sId}`);
                await window.supabaseRealtime.deleteFolder(`question_bank/${sId}`);
                await window.supabaseRealtime.deleteFolder(`assignments/${sId}`);
            }
        }

        // 2. Direct Supabase DB Table Deletion (if tables exist)
        const spClient = window.supabaseClient || (typeof getSupabaseClient === 'function' ? getSupabaseClient() : null);
        if (spClient) {
            for (const t of targetsArray) {
                try {
                    const { data, error } = await spClient.from('subjects').delete().eq('id', t);
                    if (error && error.code !== 'PGRST205') {
                        console.error('[SubjectCard] Supabase subjects table delete error:', error);
                    }
                } catch (e) {}
                try {
                    const { data, error } = await spClient.from('assignments').delete().eq('subject_key', t);
                    if (error && error.code !== 'PGRST205') {
                        console.error('[SubjectCard] Supabase assignments table delete error:', error);
                    }
                } catch (e) {}
            }
        }

        // 3. Optional backend proxy API endpoint call
        try {
            const token = window.authService ? window.authService.getToken() : localStorage.getItem('enh_auth_token');
            const apiUrl = typeof window.getApiUrl === 'function' ? window.getApiUrl('/api/subjects/delete') : '/api/subjects/delete';
            const exportData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
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
                )) {
                    exportData[key] = localStorage.getItem(key);
                }
            }

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (token || '')
                },
                body: JSON.stringify({
                    id: sId,
                    exportData: exportData
                })
            });
            if (!res.ok) {
                const errJson = await res.json().catch(() => ({ message: 'Backend delete failed' }));
                console.warn('[SubjectCard] Backend delete notice:', errJson.message);
            }
        } catch (e) {
            console.warn('[SubjectCard] Backend delete call error:', e);
        }

        // 4. Push authoritative updated state to Supabase Cloud Storage & broadcast
        await SubjectCard.pushToSupabase();
    }

    // Class method: Push all subject card state directly to Supabase Cloud Storage
    static async pushToSupabase() {
        if (window.supabaseRealtime && typeof window.supabaseRealtime.pushAndBroadcast === 'function') {
            await window.supabaseRealtime.pushAndBroadcast();
        } else if (typeof autoPublishState === 'function') {
            await autoPublishState();
        }
    }

    // Class method: Pull all subject card state from Supabase Cloud Storage
    static async loadFromSupabase() {
        if (window.supabaseRealtime && typeof window.supabaseRealtime.pullLatest === 'function') {
            await window.supabaseRealtime.pullLatest(true);
        }
    }
}
window.SubjectCard = SubjectCard;

    // Dynamic Grid Renderer
    function renderSubjectsGrid(query = '') {
        if (!subjectsContainer) return;

        const activeBranch = getActiveBranch();
        const isAdmin = checkAdminState();
        const searchLower = query.toLowerCase().trim();

        // Reload data from localStorage
        if (typeof window.loadCustomSubjectsIntoData === 'function') {
            window.loadCustomSubjectsIntoData();
        }

        // Deduplicate subject objects
        const uniqueSubjects = [];
        const seenObjects = new Set();

        for (const key in subjectsData) {
            const subj = subjectsData[key];
            if (subj && !seenObjects.has(subj)) {
                if (!subj.id) subj.id = key;
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

        // Handle empty branch view
        if (branchSubjects.length === 0) {
            subjectsContainer.style.display = 'none';
            if (branchUnavailableMessage) {
                branchUnavailableMessage.style.display = 'block';
                if (adminAddBranchSubjectBox) {
                    adminAddBranchSubjectBox.style.display = isAdmin ? 'block' : 'none';
                    if (emptyBranchName) emptyBranchName.textContent = `${activeBranch} Branch`;
                }
            }
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

        // Render HTML for matching subjects using SubjectCard class
        subjectsContainer.innerHTML = visibleSubjects.map(subj => new SubjectCard(subj).render(isAdmin)).join('');

        // Attach Edit & Delete Listeners for Subject Cards
        if (isAdmin) {
            document.querySelectorAll('.edit-subject-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openSubjectModal(btn.dataset.id);
                });
            });

            document.querySelectorAll('.delete-subject-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const sId = btn.dataset.id;
                    const subj = subjectsData[sId];
                    const title = subj ? subj.title : sId;
                    const branches = subj ? (subj.branches || ['ALL']) : ['ALL'];
                    const activeBranch = getActiveBranch();

                    const isMultiBranch = branches.includes('ALL') || branches.length > 1;

                    if (isMultiBranch) {
                        // Open subject delete options modal (Branch Only vs Global)
                        openSubjectDeleteOptionsModal(sId, title, activeBranch, branches);
                    } else {
                        // Single branch subject - Delete globally
                        if (await customConfirm(`Are you sure you want to delete "${title}"?`)) {
                            await deleteSubjectGlobally(sId, title);
                        }
                    }
                });
            });
        }
    }

    // Branch-Specific vs Global Subject Deletion Handlers
    let activeDeleteSubjectId = null;

    function openSubjectDeleteOptionsModal(sId, title, activeBranch, branches) {
        if (!subjectDeleteOptionsModal) return;

        activeDeleteSubjectId = sId;
        if (subjectDeleteModalSubtext) {
            subjectDeleteModalSubtext.innerHTML = `Subject <strong>"${escapeHTML(title)}"</strong> is currently assigned to <em>${branches.join(', ')}</em>.<br>Do you want to remove it from <strong>${activeBranch}</strong> branch only, or delete it globally across all branches?`;
        }
        if (deleteActiveBranchName) {
            deleteActiveBranchName.textContent = `${activeBranch} Branch`;
        }

        subjectDeleteOptionsModal.style.display = 'flex';
    }

    function closeSubjectDeleteOptionsModal() {
        if (subjectDeleteOptionsModal) subjectDeleteOptionsModal.style.display = 'none';
        activeDeleteSubjectId = null;
    }

    if (cancelDeleteOptionsBtn) cancelDeleteOptionsBtn.addEventListener('click', closeSubjectDeleteOptionsModal);

    if (deleteCurrentBranchOnlyBtn) {
        deleteCurrentBranchOnlyBtn.addEventListener('click', async () => {
            if (!activeDeleteSubjectId) return;
            const sId = activeDeleteSubjectId;
            const activeBranch = getActiveBranch();
            const subj = subjectsData[sId];

            if (subj) {
                let branches = subj.branches || ['ALL'];
                if (branches.includes('ALL')) {
                    const avail = typeof window.getAvailableBranches === 'function' ? window.getAvailableBranches().map(b => b.code) : ['CE', 'CSE', 'IT', 'ECE', 'AIDS'];
                    branches = avail.filter(b => b !== activeBranch);
                } else {
                    branches = branches.filter(b => b !== activeBranch);
                }

                subj.branches = branches;
                if (sId === 'maths' && subjectsData['math']) subjectsData['math'].branches = branches;
                if (sId === 'hardware' && subjectsData['coa']) subjectsData['coa'].branches = branches;

                let modifiedSubjects = {};
                try {
                    modifiedSubjects = JSON.parse(localStorage.getItem('modified_subjects_data')) || {};
                } catch (err) {}
                modifiedSubjects[sId] = { title: subj.title, semester: subj.semester, branches: branches, resources: subj.resources, customLinks: subj.customLinks };
                if (sId === 'maths') modifiedSubjects['math'] = modifiedSubjects[sId];
                if (sId === 'hardware') modifiedSubjects['coa'] = modifiedSubjects[sId];

                localStorage.setItem('modified_subjects_data', JSON.stringify(modifiedSubjects));

                showToast(`Removed "${subj.title}" from ${activeBranch} Branch.`);
            }

            closeSubjectDeleteOptionsModal();
            renderSubjectsGrid(searchInput ? searchInput.value : '');
            await autoPublishState();
        });
    }

    if (deleteGlobalSubjectBtn) {
        deleteGlobalSubjectBtn.addEventListener('click', async () => {
            if (!activeDeleteSubjectId) return;
            const sId = activeDeleteSubjectId;
            const subj = subjectsData[sId];
            const title = subj ? subj.title : sId;

            closeSubjectDeleteOptionsModal();
            await deleteSubjectGlobally(sId, title);
        });
    }

    async function deleteSubjectGlobally(sId, title) {
        await SubjectCard.deleteGlobally(sId, title);
        showToast(`Subject "${title}" deleted globally.`);
        renderSubjectsGrid(searchInput ? searchInput.value : '');
    }

    // Helper: Dynamic Custom Link Rows
    function renderCustomLinkRow(title = '', url = '') {
        if (!customLinksContainer) return;
        const row = document.createElement('div');
        row.className = 'custom-link-row';
        row.innerHTML = `
            <input type="text" class="custom-link-title" placeholder="Link Title (e.g. Reference Book)" value="${escapeHTML(title)}">
            <input type="text" class="custom-link-url" placeholder="URL (e.g. https://...)" value="${escapeHTML(url)}">
            <button type="button" class="remove-link-btn" title="Remove Link"><i class="fa-solid fa-trash"></i></button>
        `;

        row.querySelector('.remove-link-btn').addEventListener('click', () => {
            row.remove();
        });

        customLinksContainer.appendChild(row);
    }

    if (addCustomLinkBtn) {
        addCustomLinkBtn.addEventListener('click', () => {
            renderCustomLinkRow('', '');
        });
    }

    // Dynamic Branch Checkboxes inside Subject Modal
    function populateSubjectModalBranches(selectedBranches = ['ALL']) {
        if (!branchCheckboxesContainer) return;

        const availableBranches = typeof window.getAvailableBranches === 'function' ? window.getAvailableBranches() : [];

        let checkboxesHTML = `
            <label style="display: flex; align-items: center; gap: 4px; font-weight: 600; color: #0ea5e9; cursor: pointer;">
                <input type="checkbox" class="branch-checkbox" value="ALL" ${selectedBranches.includes('ALL') ? 'checked' : ''}> ALL Branches
            </label>
        `;

        availableBranches.forEach(b => {
            checkboxesHTML += `
                <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                    <input type="checkbox" class="branch-checkbox" value="${b.code}" ${selectedBranches.includes(b.code) ? 'checked' : ''}> ${escapeHTML(b.name)}
                </label>
            `;
        });

        branchCheckboxesContainer.innerHTML = checkboxesHTML;
    }

    // Subject Modal Handlers
    function openSubjectModal(editId = null, targetBranch = null) {
        if (!subjectModalBackdrop) return;

        if (customLinksContainer) customLinksContainer.innerHTML = '';

        subjectModalEditId.value = editId || '';

        if (editId && subjectsData[editId]) {
            const subj = subjectsData[editId];
            subjectModalTitle.textContent = 'Edit Subject';
            subjectTitleInput.value = subj.title || '';
            subjectCodeInput.value = subj.id || '';
            subjectCodeInput.disabled = true;
            subjectSemSelect.value = subj.semester || 'Semester 2';

            const selectedBranches = subj.branches || ['ALL'];
            populateSubjectModalBranches(selectedBranches);

            const res = subj.resources || { notes: true, qb: true, assignments: true };
            const isResCheck = (val) => val !== false && val !== 'false' && val !== 0 && val !== '0' && val !== undefined;
            if (resNotesCheckbox) resNotesCheckbox.checked = isResCheck(res.notes);
            if (resQbCheckbox) resQbCheckbox.checked = isResCheck(res.qb);
            if (resAssCheckbox) resAssCheckbox.checked = isResCheck(res.assignments);

            if (subj.customLinks && Array.isArray(subj.customLinks)) {
                subj.customLinks.forEach(link => {
                    renderCustomLinkRow(link.title, link.url);
                });
            }
        } else {
            subjectModalTitle.textContent = 'Add New Subject';
            subjectForm.reset();
            subjectCodeInput.disabled = false;

            const activeBranch = targetBranch || getActiveBranch();
            const defaultSelected = (activeBranch === 'CE' || activeBranch === 'ALL') ? ['ALL'] : [activeBranch, 'ALL'];
            populateSubjectModalBranches(defaultSelected);

            if (resNotesCheckbox) resNotesCheckbox.checked = true;
            if (resQbCheckbox) resQbCheckbox.checked = true;
            if (resAssCheckbox) resAssCheckbox.checked = true;
        }

        subjectModalBackdrop.style.display = 'flex';
    }

    function closeSubjectModal() {
        if (subjectModalBackdrop) subjectModalBackdrop.style.display = 'none';
    }

    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', () => openSubjectModal(null));
    }
    if (emptyBranchAddSubjectBtn) {
        emptyBranchAddSubjectBtn.addEventListener('click', () => openSubjectModal(null, getActiveBranch()));
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
            document.querySelectorAll('.branch-checkbox').forEach(cb => {
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

            // Remove code & all aliases/titles from tombstone lists if previously deleted
            if (typeof window.removeSubjectFromDeletedTombstones === 'function') {
                window.removeSubjectFromDeletedTombstones(code);
                window.removeSubjectFromDeletedTombstones(title);
                if (editId) window.removeSubjectFromDeletedTombstones(editId);
            }

            const resourcesObj = {
                notes: resNotesCheckbox ? resNotesCheckbox.checked : true,
                qb: resQbCheckbox ? resQbCheckbox.checked : true,
                assignments: resAssCheckbox ? resAssCheckbox.checked : true
            };

            const customLinksArr = [];
            if (customLinksContainer) {
                const rows = customLinksContainer.querySelectorAll('.custom-link-row');
                rows.forEach(row => {
                    const lTitle = row.querySelector('.custom-link-title').value.trim();
                    const lUrl = row.querySelector('.custom-link-url').value.trim();
                    if (lTitle && lUrl) {
                        customLinksArr.push({ title: lTitle, url: lUrl, icon: 'fa-solid fa-link' });
                    }
                });
            }

            const targetId = editId || code;
            let existingSubj = targetId ? subjectsData[targetId] : null;

            const card = new SubjectCard({
                id: targetId,
                title: title,
                semester: semester,
                branches: selectedBranches,
                resources: resourcesObj,
                customLinks: customLinksArr,
                chapters: existingSubj ? existingSubj.chapters : undefined,
                questionBanks: existingSubj ? existingSubj.questionBanks : undefined,
                assignments: existingSubj ? existingSubj.assignments : undefined
            });

            await card.save(editId);

            closeSubjectModal();
            showToast(`Subject "${title}" saved successfully!`);
            renderSubjectsGrid(searchInput ? searchInput.value : '');
        });
    }

    // Mark State as Modified / Unpublished
    async function autoPublishState() {
        if (typeof window.markUnpublishedChanges === 'function') {
            window.markUnpublishedChanges();
        }
        if (window.supabaseRealtime && typeof window.supabaseRealtime.pushAndBroadcast === 'function') {
            await window.supabaseRealtime.pushAndBroadcast();
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
            const isOpen = homeSidebar.classList.toggle('active');
            if (isOpen) {
                homeSidebar.classList.remove('collapsed');
            } else {
                homeSidebar.classList.add('collapsed');
            }
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900 && homeSidebar.classList.contains('active')) {
                if (!homeSidebar.contains(e.target) && !homeSidebarToggle.contains(e.target)) {
                    homeSidebar.classList.remove('active');
                    homeSidebar.classList.add('collapsed');
                }
            }
        });
    }


    // Subscribe to Realtime Supabase updates & State Refresh events
    if (window.supabaseRealtime) {
        window.supabaseRealtime.subscribe(() => {
            if (typeof window.loadCustomSubjectsIntoData === 'function') {
                window.loadCustomSubjectsIntoData();
            }
            renderBranchesSidebar();
            renderSubjectsGrid(searchInput ? searchInput.value : '');
        });
    }

    window.addEventListener('academicStateRefreshed', () => {
        if (typeof window.loadCustomSubjectsIntoData === 'function') {
            window.loadCustomSubjectsIntoData();
        }
        checkAdminState();
        renderBranchesSidebar();
        renderSubjectsGrid(searchInput ? searchInput.value : '');
    });

    window.addEventListener('auth_state_changed', () => {
        checkAdminState();
        renderBranchesSidebar();
        renderSubjectsGrid(searchInput ? searchInput.value : '');
    });

    // Initial Load & Cloud Sync (Instant local render + background cloud sync)
    async function init() {
        checkAdminState();
        renderBranchesSidebar();

        const subjectsGridEl = document.getElementById('subjectsContainer') || document.getElementById('subjectsGrid');
        const loadingHTML = (window.LoadingContentManager && typeof window.LoadingContentManager.getLoadingSpinnerHTML === 'function')
            ? window.LoadingContentManager.getLoadingSpinnerHTML('Loading latest data from Supabase...')
            : '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top: 10px;">Loading latest data from Supabase...</p></div>';

        if (subjectsGridEl) {
            subjectsGridEl.innerHTML = `<div style="grid-column: 1 / -1;">${loadingHTML}</div>`;
        }

        // Render cached local subjects immediately if present
        renderSubjectsGrid(searchInput ? searchInput.value : '');

        if (window.supabaseRealtime && window.supabaseRealtime.pullLatest) {
            try {
                await window.supabaseRealtime.pullLatest();
            } catch (e) {
                console.warn('Initial cloud pull error:', e);
            }
        }

        checkAdminState();
        renderBranchesSidebar();
        renderSubjectsGrid(searchInput ? searchInput.value : '');
    }
    init();

});
