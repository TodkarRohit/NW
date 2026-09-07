// Engineering Notes Hub - Resource Viewer & Upload Management Script

document.addEventListener('DOMContentLoaded', () => {
    class ThemeManager {
        static init() {
            const themeToggleBtn = document.getElementById('themeToggleBtn');
            const savedTheme = localStorage.getItem('theme') || 'light';
            ThemeManager.applyTheme(savedTheme, themeToggleBtn);

            document.body.addEventListener('click', (e) => {
                if (e.target.closest('#themeToggleBtn')) {
                    const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
                    ThemeManager.applyTheme(currentTheme === 'dark' ? 'light' : 'dark', themeToggleBtn);
                }
            });
        }

        static applyTheme(theme, btn) {
            if (theme === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if (btn) {
                    btn.innerHTML = '<i class="fa-solid fa-sun" style="color:#facc15"></i> <span class="theme-btn-text">Light Mode</span>';
                }
            } else {
                document.body.removeAttribute('data-theme');
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                if (btn) {
                    btn.innerHTML = '<i class="fa-solid fa-moon" style="color:#38bdf8"></i> <span class="theme-btn-text">Dark Mode</span>';
                }
            }
        }
    }

    ThemeManager.init();

    // 1. Parse URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    let subjectKey = urlParams.get('subject') || 'dsa';
    const rawResType = (urlParams.get('type') || 'notes').toLowerCase();
    const resourceType = (rawResType === 'qb' || rawResType === 'question_bank') ? 'qb' : (rawResType === 'assignments' || rawResType === 'assignment' ? 'assignments' : 'notes');
    const isQB = resourceType === 'qb';
    const isAss = resourceType === 'assignments';

    // Helper function to check if logged in user is Admin
    function checkIsAdmin() {
        const user = window.authService ? window.authService.getUser() : null;
        const uname = user ? String(user.username || '').toLowerCase() : '';
        const uemail = user ? String(user.email || '').toLowerCase() : '';
        return (
            localStorage.getItem('isAdminMode') === 'true' ||
            (user && (
                user.is_admin === true ||
                user.is_admin === 'true' ||
                user.role === 'admin' ||
                String(user.role || '').toLowerCase() === 'admin' ||
                uname === 'rohittodkar92' ||
                uname === 'admin' ||
                uname.includes('rohittodkar') ||
                uemail.includes('rohittodkar')
            ))
        );
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Set data-resource on body for scoped theme styling (notes vs qb vs assignments)
    document.body.setAttribute('data-resource', resourceType);

    // Ensure custom subjects are loaded from localStorage before lookup
    if (typeof window.loadCustomSubjectsIntoData === 'function') {
        window.loadCustomSubjectsIntoData();
    }

    if (subjectKey === 'math') subjectKey = 'maths';
    if (subjectKey === 'hardware') subjectKey = 'coa';

    const defaultSubjectTitles = {
        'dsa': 'Data Structure and Algorithm(C++)',
        'oop': 'Object Oriented Programming (Using C++)',
        'maths': 'Engineering Mathematics',
        'math': 'Engineering Mathematics',
        'hardware': 'Computer Organization and Architecture',
        'coa': 'Computer Organization and Architecture',
        'os': 'Operating System'
    };

    // 2. Load Subject Data
    let subjectData = subjectsData[subjectKey];
    if (!subjectData) {
        const foundKey = Object.keys(subjectsData).find(k => k.toLowerCase() === subjectKey.toLowerCase());
        if (foundKey) {
            subjectKey = foundKey;
            subjectData = subjectsData[subjectKey];
        }
    }
    if (!subjectData) {
        const resolvedTitle = defaultSubjectTitles[subjectKey.toLowerCase()] || (subjectKey ? subjectKey.toUpperCase() : 'Subject');
        subjectData = {
            id: subjectKey,
            title: resolvedTitle,
            semester: 'Semester 2',
            chapters: [],
            questionBanks: [],
            assignments: []
        };
    }

    // 3. DOM Elements
    const subjectHeading = document.getElementById('subjectHeading');
    const resourceTypeBadge = document.getElementById('resourceTypeBadge');
    const sidebarSectionTitle = document.getElementById('sidebarSectionTitle');
    const chapterCount = document.getElementById('chapterCount');
    const chapterList = document.getElementById('chapterList');
    const notesDocument = document.getElementById('notesDocument');
    const currentChapterName = document.getElementById('currentChapterName');
    const itemUploadStatus = document.getElementById('itemUploadStatus');
    const statusText = document.getElementById('statusText');
    const chapterSearchInput = document.getElementById('chapterSearchInput');

    const fileUploadInput = document.getElementById('fileUploadInput');

    const prevChapterBtn = document.getElementById('prevChapterBtn');
    const nextChapterBtn = document.getElementById('nextChapterBtn');
    const prevChapterTitle = document.getElementById('prevChapterTitle');
    const nextChapterTitle = document.getElementById('nextChapterTitle');

    const printBtn = document.getElementById('printBtn');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebarPanel = document.getElementById('sidebarPanel');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');

    // Quick Switcher Links via NavigationManager OOP Class
    if (typeof NavigationManager !== 'undefined') {
        NavigationManager.connectHeaderTabs(subjectKey, resourceType === 'qb' ? 'qb' : (resourceType === 'assignments' ? 'assignments' : 'notes'));
    }


    // 4. Update Header Meta
    let typeLabel = "Study Notes";
    let itemSingular = "Chapter";
    let itemPlural = "Chapters";

    if (isQB) {
        typeLabel = "Question Banks";
        itemSingular = "Question Bank";
        itemPlural = "Question Banks";
    } else if (isAss) {
        typeLabel = "Assignments";
        itemSingular = "Assignment";
        itemPlural = "Assignments";
    }

    subjectHeading.textContent = subjectData.title;
    resourceTypeBadge.textContent = typeLabel;
    sidebarSectionTitle.textContent = isQB ? "Question Banks" : (isAss ? "Assignments List" : "Chapter List");

    document.title = `${subjectData.title} - ${typeLabel} | Engineering Notes Hub`;

    let rawItems = [];
    if (isQB) {
        rawItems = subjectData.questionBanks || subjectData.chapters || [];
    } else if (isAss) {
        rawItems = subjectData.assignments || subjectData.chapters || [];
    } else {
        rawItems = subjectData.chapters || [];
    }
    const items = JSON.parse(JSON.stringify(rawItems));

    // Ensure items is never empty (fallback default 4 units)
    if (!items || items.length === 0) {
        items.push(
            { id: `${subjectKey}-u1`, title: "Unit 1: Fundamentals & Concepts", unit: "Unit 1", name: "Fundamentals & Concepts" },
            { id: `${subjectKey}-u2`, title: "Unit 2: Core Architecture & Methods", unit: "Unit 2", name: "Core Architecture & Methods" },
            { id: `${subjectKey}-u3`, title: "Unit 3: Advanced Operations", unit: "Unit 3", name: "Advanced Operations" },
            { id: `${subjectKey}-u4`, title: "Unit 4: Applications & Implementation", unit: "Unit 4", name: "Applications & Implementation" }
        );
    }

    // Load any custom items from localStorage on startup
    const customItemsKey = `custom_items_${subjectKey}_${resourceType}`;
    const modifiedItemsKey = `modified_items_${subjectKey}_${resourceType}`;
    let modifiedItems = {};
    try {
        const customItems = JSON.parse(localStorage.getItem(customItemsKey)) || [];
        if (customItems.length > 0) {
            items.push(...customItems);
        }
        modifiedItems = JSON.parse(localStorage.getItem(modifiedItemsKey)) || {};
    } catch (e) { }

    function syncSaveUnitMod(sKey, idx, itemObj, newTitle, newName) {
        if (!sKey) return;
        const norm = sKey.toLowerCase();
        const alias = norm === 'math' ? 'maths' : (norm === 'coa' ? 'hardware' : norm);
        const modObj = { title: newTitle, name: newName };

        [norm, alias].forEach(k => {
            const gKey = `modified_units_${k}`;
            try {
                let gMods = JSON.parse(localStorage.getItem(gKey)) || {};
                if (itemObj && itemObj.id) gMods[itemObj.id] = modObj;
                if (itemObj && itemObj.unit) gMods[itemObj.unit] = modObj;
                gMods[`unit_idx_${idx}`] = modObj;
                localStorage.setItem(gKey, JSON.stringify(gMods));
            } catch (e) {}

            ['notes', 'question_bank', 'assignments'].forEach(rType => {
                const rKey = `modified_items_${k}_${rType}`;
                try {
                    let rMods = JSON.parse(localStorage.getItem(rKey)) || {};
                    if (itemObj && itemObj.id) rMods[itemObj.id] = modObj;
                    if (itemObj && itemObj.unit) rMods[itemObj.unit] = modObj;
                    rMods[`unit_idx_${idx}`] = modObj;
                    localStorage.setItem(rKey, JSON.stringify(rMods));
                } catch (e) {}
            });
        });
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

    items.forEach((item, idx) => {
        const syncMod = syncGetUnitMod(subjectKey, item.id, item.unit, idx);
        if (syncMod) {
            if (syncMod.title) item.title = syncMod.title;
            if (syncMod.name) item.name = syncMod.name;
        } else if (modifiedItems[item.id]) {
            item.title = modifiedItems[item.id].title;
            item.name = modifiedItems[item.id].name;
        }
    });

    chapterCount.textContent = `${items.length} ${items.length === 1 ? itemSingular : itemPlural}`;

    let activeIndex = 0;
    let currentQBView = 'questions'; // 'questions' or 'answers'/'solutions'

    // Helper: Local Storage Key for Persisted Uploads
    function getStorageKey(itemIndex, viewType = null) {
        if (!items[itemIndex]) return `doc_upload_${subjectKey}_${resourceType}_default`;
        const item = items[itemIndex];
        const itemId = item.id || `unit_${itemIndex}`;

        if (isQB || isAss) {
            const targetView = viewType || currentQBView || 'questions';
            const key = `doc_upload_${subjectKey}_${resourceType}_${itemId}_${targetView}`;
            if (localStorage.getItem(key)) return key;
            if (targetView === 'questions') {
                const legacyKey = `doc_upload_${subjectKey}_${resourceType}_${itemId}`;
                if (localStorage.getItem(legacyKey)) return legacyKey;
            }
            return key;
        }
        return `doc_upload_${subjectKey}_${resourceType}_${itemId}`;
    }

    // 5. Render Sidebar Items List
    function renderItemList(filterText = '') {
        chapterList.innerHTML = '';
        const searchLower = (filterText || '').toLowerCase();

        chapterCount.textContent = `${items.length} ${items.length === 1 ? itemSingular : itemPlural}`;

        items.forEach((item, index) => {
            if (!item) return;
            const displayTitle = item.title || item.name || `Unit ${index + 1}`;
            const displayName = item.name || item.title || '';
            const matches = displayTitle.toLowerCase().includes(searchLower) || displayName.toLowerCase().includes(searchLower);

            if (matches) {
                let uploadedFiles = [];
                if (isQB || isAss) {
                    const qDataStr = localStorage.getItem(getStorageKey(index, 'questions'));
                    const aDataStr = localStorage.getItem(getStorageKey(index, isAss ? 'solutions' : 'answers'));
                    if (qDataStr) {
                        try { uploadedFiles.push(JSON.parse(qDataStr)); } catch (e) { }
                    }
                    if (aDataStr) {
                        try { uploadedFiles.push(JSON.parse(aDataStr)); } catch (e) { }
                    }
                } else {
                    const nDataStr = localStorage.getItem(getStorageKey(index));
                    if (nDataStr) {
                        try { uploadedFiles.push(JSON.parse(nDataStr)); } catch (e) { }
                    }
                }
                const hasDoc = uploadedFiles.length > 0;

                const itemBtn = document.createElement('li');
                itemBtn.style.display = 'flex';
                itemBtn.style.flexDirection = 'column';
                itemBtn.style.gap = '0';

                const btnInner = document.createElement('button');
                btnInner.className = `chapter-item ${index === activeIndex ? 'active' : ''}`;
                btnInner.setAttribute('type', 'button');
                btnInner.style.width = '100%';

                const isAdminMode = checkIsAdmin();

                btnInner.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; width: 100%;">
                        <span class="chapter-item-title" style="flex:1; text-align:left;">${escapeHTML(displayTitle)}</span>
                        <div style="display:flex; align-items:center; gap:4px;">
                            ${hasDoc ? `<span style="font-size: 0.7rem; background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: 700; white-space: nowrap;">Uploaded</span>` : ''}
                            ${isAdminMode ? `
                                <button type="button" class="edit-unit-btn" data-index="${index}" style="background:transparent; border:none; color:#0ea5e9; cursor:pointer; padding:2px;" title="Edit Unit"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button type="button" class="delete-unit-btn" data-index="${index}" style="background:transparent; border:none; color:#ef4444; cursor:pointer; padding:2px;" title="Delete Unit"><i class="fa-solid fa-trash"></i></button>
                            ` : ''}
                        </div>
                    </div>
                `;

                // Edit event listener
                const editBtn = btnInner.querySelector('.edit-unit-btn');
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openUnitModal(index);
                    });
                }

                // Delete event listener
                const deleteBtn = btnInner.querySelector('.delete-unit-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async (e) => {
                        e.stopPropagation(); // prevent selecting the item
                        if (await customConfirm(`Are you sure you want to delete "${item.title}"?`)) {
                            // Find and remove from customItems if it's a custom item
                            const customItemsKey = `custom_items_${subjectKey}_${resourceType}`;
                            let customItems = JSON.parse(localStorage.getItem(customItemsKey)) || [];
                            const isCustom = customItems.some(ci => ci.id === item.id);

                            if (isCustom) {
                                customItems = customItems.filter(ci => ci.id !== item.id);
                                localStorage.setItem(customItemsKey, JSON.stringify(customItems));
                            }

                            items.splice(index, 1);

                            localStorage.removeItem(getStorageKey(index, 'questions'));
                            localStorage.removeItem(getStorageKey(index, 'answers'));
                            localStorage.removeItem(getStorageKey(index, null));

                            chapterCount.textContent = `${items.length} ${items.length === 1 ? itemSingular : itemPlural}`;
                            renderItemList(chapterSearchInput ? chapterSearchInput.value : '');

                            if (activeIndex === index) activeIndex = 0;
                            else if (activeIndex > index) activeIndex--;
                            loadItemContent(activeIndex);
                            await autoPublishState();
                        }
                    });
                }

                itemBtn.appendChild(btnInner);

                if (index === activeIndex && hasDoc) {
                    const dropdown = document.createElement('div');
                    dropdown.style.padding = '10px 12px';
                    dropdown.style.background = 'var(--bg-page)';
                    dropdown.style.border = '1px solid var(--border-color)';
                    dropdown.style.borderTop = 'none';
                    dropdown.style.borderBottomLeftRadius = '10px';
                    dropdown.style.borderBottomRightRadius = '10px';
                    dropdown.style.fontSize = '0.85rem';
                    dropdown.style.display = 'flex';
                    dropdown.style.flexDirection = 'column';
                    dropdown.style.gap = '8px';

                    // Adjust button radius so it merges with dropdown
                    btnInner.style.borderBottomLeftRadius = '0';
                    btnInner.style.borderBottomRightRadius = '0';
                    btnInner.style.borderBottom = '1px solid transparent';

                    dropdown.innerHTML = uploadedFiles.map(f => `
                        <div style="display: flex; align-items: center; gap: 8px; color: var(--text-muted);">
                            <i class="fa-regular fa-file-pdf" style="color: #ef4444; font-size: 1.1rem;"></i>
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;" title="${f.name}">${f.name}</span>
                        </div>
                    `).join('');

                    itemBtn.appendChild(dropdown);
                }

                itemBtn.addEventListener('click', () => {
                    activeIndex = index;
                    renderItemList(chapterSearchInput.value);
                    loadItemContent(activeIndex);

                    // Close mobile sidebar if opened
                    if (window.innerWidth <= 900) {
                        sidebarPanel.classList.remove('open');
                        sidebarBackdrop.classList.remove('active');
                    }
                });

                chapterList.appendChild(itemBtn);
            }
        });

        if (chapterList.children.length === 0) {
            chapterList.innerHTML = `<div style="padding: 1.5rem 1rem; color: #94a3b8; font-size: 0.9rem; text-align: center;">No matching ${itemPlural.toLowerCase()} found</div>`;
        }
    }

    // Sidebar Filter Search Listener & Keyboard Shortcut
    const chapterSearchClearBtn = document.getElementById('chapterSearchClearBtn');

    function performChapterSearch(query) {
        const text = query.toLowerCase().trim();
        if (chapterSearchClearBtn) {
            chapterSearchClearBtn.style.display = text.length > 0 ? 'flex' : 'none';
        }
        renderItemList(text);
    }

    if (chapterSearchInput) {
        chapterSearchInput.addEventListener('input', (e) => performChapterSearch(e.target.value));

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                chapterSearchInput.focus();
                chapterSearchInput.select();
            } else if (e.key === 'Escape' && document.activeElement === chapterSearchInput) {
                chapterSearchInput.value = '';
                performChapterSearch('');
                chapterSearchInput.blur();
            }
        });
    }

    if (chapterSearchClearBtn) {
        chapterSearchClearBtn.addEventListener('click', () => {
            if (chapterSearchInput) {
                chapterSearchInput.value = '';
                performChapterSearch('');
                chapterSearchInput.focus();
            }
        });
    }

    function loadItemContent(index) {
        if (!items || items.length === 0) {
            currentChapterName.textContent = "No Unit Selected";
            notesDocument.innerHTML = `
                <div style="padding: 4rem 2rem; text-align: center; color: var(--text-muted);">
                    <i class="fa-solid fa-folder-open" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-dark);">No Units Currently Available</h3>
                    <p style="margin-bottom: 1.5rem;">There are no units or materials created for this subject yet.</p>
                    ${checkIsAdmin() ? `
                        <button type="button" class="upload-modal-btn" onclick="openUnitModal()" style="margin: 0 auto; display: inline-flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-plus"></i> Add First Unit
                        </button>
                    ` : ''}
                </div>
            `;
            return;
        }

        if (!items[index]) index = 0;
        activeIndex = index;
        try {
            sessionStorage.setItem(`active_index_${subjectKey}_${resourceType}`, index);
        } catch (e) { }

        const currentItem = items[index];
        currentChapterName.textContent = currentItem.title;

        // Question Bank / Assignment Sub-Tab Bar HTML
        let qbTabBarHTML = '';
        if (isQB || isAss) {
            const isAnswerActive = currentQBView === 'answers' || currentQBView === 'solutions';
            qbTabBarHTML = `
                <div class="qb-switcher-container">
                    <div class="qb-tab-bar">
                        <button type="button" class="qb-tab-btn question-tab ${!isAnswerActive ? 'active' : ''}" id="qbQuestionTabBtn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <circle cx="12" cy="13" r="1"></circle>
                                <path d="M12 17h.01"></path>
                            </svg>
                            <span>QUESTIONS</span>
                        </button>
                        <div class="qb-tab-chevron">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                        <button type="button" class="qb-tab-btn answer-tab ${isAnswerActive ? 'active' : ''}" id="qbAnswerTabBtn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span>${isAss ? 'SOLUTIONS' : 'ANSWERS'}</span>
                        </button>
                    </div>
                </div>
            `;
        }

        // Check if an uploaded document exists for current view
        const storageKey = getStorageKey(index, isQB ? currentQBView : null);
        const storedDocJSON = localStorage.getItem(storageKey);

        if (storedDocJSON) {
            const docData = JSON.parse(storedDocJSON);
            itemUploadStatus.className = "status-indicator uploaded";
            const isAdminMode = checkIsAdmin();
            statusText.textContent = isQB ? `${currentQBView === 'questions' ? 'Question' : 'Answer'} PDF Attached` : "Document Attached";

            notesDocument.innerHTML = `
                ${qbTabBarHTML}

                <div class="structure-header">
                    <h2>${currentItem.title} ${isQB ? `(${currentQBView === 'questions' ? 'Question Paper' : 'Answer Key & Solutions'})` : ''}</h2>
                    <p>${subjectData.title} &bull; ${typeLabel}</p>
                </div>

                <div class="uploaded-document-card">
                    <div class="doc-preview-body">
                        ${docData.type.startsWith('image/') ? `
                            <img src="${docData.data}" alt="Document Preview" style="max-width: 100%; max-height: 480px; object-fit: contain; border-radius: 6px;">
                        ` : docData.type === 'application/pdf' ? `
                            <iframe src="${docData.data}" title="PDF Preview"></iframe>
                        ` : `
                            <div style="text-align: center; padding: 2rem; color: #475569;">
                                <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">📄 ${docData.name}</p>
                                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.25rem;">File is ready for viewing and download.</p>
                                <a href="${docData.data}" download="${docData.name}" class="upload-action-pill" style="text-decoration: none; display: inline-block;">📥 Download Attached File</a>
                            </div>
                        `}
                    </div>

                    <div class="uploaded-doc-header">
                        <div class="doc-info">
                            <div class="doc-file-icon">📄</div>
                            <div>
                                <div class="doc-name">${docData.name}</div>
                                <div class="doc-meta">Uploaded on ${docData.date} &bull; ${(docData.size / 1024).toFixed(1)} KB</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                            <div class="pdf-mode-switcher">
                                <button class="pdf-mode-btn active" data-mode="normal" title="1st Mode: Normal View">
                                    <i class="fa-solid fa-table-cells-large"></i> <span>1st Mode</span>
                                </button>
                                <button class="pdf-mode-btn" data-mode="fullsite" title="2nd Mode: Full Site View">
                                    <i class="fa-solid fa-expand"></i> <span>2nd Mode</span>
                                </button>
                                <button class="pdf-mode-btn" data-mode="fullscreen" title="3rd Mode: Monitor Full Screen">
                                    <i class="fa-solid fa-maximize"></i> <span>3rd Mode</span>
                                </button>
                            </div>
                            <div class="doc-actions">
                                ${isAdminMode ? `
                                    <button class="doc-action-btn" id="reUploadBtn">Replace ${isQB ? (currentQBView === 'questions' ? 'Question' : 'Answer') : ''} File</button>
                                    <button class="doc-action-btn delete-btn" id="deleteDocBtn">Remove</button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="document-outline-card">
                    <h4>📋 ${isQB ? (currentQBView === 'questions' ? 'Question Bank Paper' : 'Answer Key & Solutions') : 'Chapter'} Details</h4>
                    <div class="outline-sections-grid">
                        <div class="outline-item"><span class="outline-item-num">01</span> ${currentItem.name || currentItem.title}</div>
                        <div class="outline-item"><span class="outline-item-num">02</span> Subject: ${subjectData.title}</div>
                        <div class="outline-item"><span class="outline-item-num">03</span> Semester: ${subjectData.semester}</div>
                        <div class="outline-item"><span class="outline-item-num">04</span> View Mode: ${isQB ? currentQBView.toUpperCase() : 'Study Notes'}</div>
                    </div>
                </div>
            `;

            // Attach replace & delete events
            const reUploadBtn = document.getElementById('reUploadBtn');
            if (reUploadBtn) {
                reUploadBtn.addEventListener('click', () => fileUploadInput.click());
            }
            const deleteFileBtn = document.getElementById('deleteDocBtn');
            if (deleteFileBtn && currentItem) {
                deleteFileBtn.onclick = async () => {
                    if (!checkIsAdmin()) {
                        alert("Only administrators can delete files.");
                        return;
                    }
                    if (await customConfirm(`Remove uploaded ${isQB ? currentQBView : ''} file for ${currentItem.title}?`)) {
                        // 1. Remove from localStorage
                        localStorage.removeItem(storageKey);

                        // 2. Track deleted key permanently in deleted_keys_global
                        let deletedKeys = [];
                        try {
                            deletedKeys = JSON.parse(localStorage.getItem('deleted_keys_global')) || [];
                        } catch (e) { }
                        if (!deletedKeys.includes(storageKey)) {
                            deletedKeys.push(storageKey);
                        }
                        localStorage.setItem('deleted_keys_global', JSON.stringify(deletedKeys));

                        // 3. Delete physical binary file from Supabase Storage
                        if (docData && docData.data && docData.data.includes('academic-files/')) {
                            try {
                                const relativePath = docData.data.split('academic-files/')[1];
                                if (relativePath) {
                                    const token = window.authService ? window.authService.getToken() : localStorage.getItem('enh_auth_token');
                                    const apiUrl = typeof window.getApiUrl === 'function' ? window.getApiUrl('/api/assignments/delete-file') : '/api/assignments/delete-file';
                                    await fetch(apiUrl, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': 'Bearer ' + (token || '')
                                        },
                                        body: JSON.stringify({ path: relativePath })
                                    });
                                }
                            } catch (err) {
                                console.error("Storage delete warning:", err);
                            }
                        }

                        renderItemList(chapterSearchInput.value);
                        loadItemContent(index);
                        showToast("File permanently deleted.");
                        await autoPublishState();
                    }
                };
            }

        } else if (isQB) {
            // Built-in Question Bank Empty View
            itemUploadStatus.className = "status-indicator";
            statusText.textContent = currentQBView === 'questions' ? "No Question Paper PDF" : "No Answer Key PDF";

            const isAdminMode = checkIsAdmin();

            const paperViewHTML = `
                <div class="qb-paper-view ${currentQBView === 'questions' ? 'question-paper' : 'answer-paper'}">
                    <div class="paper-header">
                        <div class="paper-badge ${currentQBView === 'questions' ? 'question-badge' : 'answer-badge'}">
                            ${currentQBView === 'questions' ? 'QUESTION PAPER' : 'MODEL SOLUTIONS & ANSWER KEY'}
                        </div>
                        <h3>${currentItem.title}</h3>
                        <p class="paper-sub">${subjectData.title} &bull; ${subjectData.semester}</p>
                    </div>
                    <div class="paper-section" style="text-align: center; padding: 2.5rem 1rem;">
                        <div style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem;">📄</div>
                        <h4 style="margin-bottom: 0.5rem; color: var(--text-dark);">No ${currentQBView === 'questions' ? 'Question Paper' : 'Answer Key'} PDF Uploaded Yet</h4>
                        <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 450px; margin: 0 auto 1.5rem;">
                            ${isAdminMode ? `Upload your ${currentQBView === 'questions' ? 'Question Paper' : 'Model Answer'} PDF file for ${currentItem.title} to display it here.` : `The administrator has not uploaded a ${currentQBView === 'questions' ? 'Question Paper' : 'Model Answer'} PDF for this unit yet.`}
                        </p>
                        ${isAdminMode ? `
                        <button type="button" class="upload-action-pill" id="stripUploadBtn" style="display: inline-flex; gap: 0.5rem; align-items: center;">
                            <i class="fa-solid fa-cloud-arrow-up"></i> Upload ${currentQBView === 'questions' ? 'Question' : 'Answer'} PDF
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;

            notesDocument.innerHTML = `
                ${qbTabBarHTML}
                ${paperViewHTML}

                <div class="document-outline-card">
                    <h4>📋 Question Bank Details</h4>
                    <div class="outline-sections-grid">
                        <div class="outline-item"><span class="outline-item-num">01</span> ${currentItem.name || currentItem.title}</div>
                        <div class="outline-item"><span class="outline-item-num">02</span> Subject: ${subjectData.title}</div>
                        <div class="outline-item"><span class="outline-item-num">03</span> Semester: ${subjectData.semester}</div>
                        <div class="outline-item"><span class="outline-item-num">04</span> Active Tab: ${currentQBView.toUpperCase()}</div>
                    </div>
                </div>
            `;

            const stripBtn = document.getElementById('stripUploadBtn');
            if (stripBtn) stripBtn.addEventListener('click', () => openQbUploadModal(currentQBView));

        } else {
            // Clean Upload / Outline Blueprint Structure for Study Notes
            itemUploadStatus.className = "status-indicator";
            statusText.textContent = "No Notes PDF";
            const isAdminMode = checkIsAdmin();

            notesDocument.innerHTML = `
                <div class="structure-header">
                    <h2>${currentItem.title}</h2>
                    <p>${subjectData.title} &bull; ${typeLabel}</p>
                </div>
                ${isAdminMode ? `
                <!-- Interactive Upload Dropzone Structure -->
                <div class="upload-dropzone" id="dropzoneBox">
                    <div class="upload-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </div>
                    <h3>Upload ${typeLabel} PDF</h3>
                    <p>Click here or drag & drop your PDF document for <strong>${currentItem.title}</strong>.</p>
                    <div class="upload-action-pill">Choose PDF File</div>
                </div>
                ` : `
                <div class="upload-dropzone" style="background: var(--bg-surface); border-style: dashed; padding: 25px; text-align: center;">
                    <div style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem;">📚</div>
                    <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">No Study Notes PDF Uploaded</h3>
                    <p style="color: var(--text-muted);">The administrator has not uploaded a study notes PDF for this unit yet.</p>
                </div>
                `}
                <!-- Structured Outline Layout -->
                <div class="document-outline-card">
                    <h4>📋 Chapter Details</h4>
                    <div class="outline-sections-grid">
                        <div class="outline-item"><span class="outline-item-num">01</span> ${currentItem.name || currentItem.title}</div>
                        <div class="outline-item"><span class="outline-item-num">02</span> Subject: ${subjectData.title}</div>
                        <div class="outline-item"><span class="outline-item-num">03</span> Semester: ${subjectData.semester}</div>
                        <div class="outline-item"><span class="outline-item-num">04</span> Status: Ready for Upload</div>
                    </div>
                </div>
            `;

            // Dropzone Click & Drag Events
            const dropzoneBox = document.getElementById('dropzoneBox');
            if (dropzoneBox) {
                dropzoneBox.addEventListener('click', () => fileUploadInput.click());

                dropzoneBox.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropzoneBox.classList.add('dragover');
                });

                dropzoneBox.addEventListener('dragleave', () => {
                    dropzoneBox.classList.remove('dragover');
                });

                dropzoneBox.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropzoneBox.classList.remove('dragover');
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelection(e.dataTransfer.files[0]);
                    }
                });
            }
        }

        // Attach event listeners for QB / Assignment Questions vs Answers/Solutions tab buttons if present
        if (isQB || isAss) {
            const qbQuestionTabBtn = document.getElementById('qbQuestionTabBtn');
            const qbAnswerTabBtn = document.getElementById('qbAnswerTabBtn');

            if (qbQuestionTabBtn) {
                qbQuestionTabBtn.addEventListener('click', () => {
                    currentQBView = 'questions';
                    loadItemContent(index);
                });
            }
            if (qbAnswerTabBtn) {
                qbAnswerTabBtn.addEventListener('click', () => {
                    currentQBView = isAss ? 'solutions' : 'answers';
                    loadItemContent(index);
                });
            }
        }

        // Update Download Button Label
        updateDownloadBtnUI();

        // Scroll to top
        const previewPanel = document.getElementById('previewPanel');
        previewPanel.scrollTo({ top: 0, behavior: 'smooth' });

        // Update Pagination
        updatePagination(index);
    }

    // 7. Question Bank Upload Modal & File Selection
    const qbUploadModalBackdrop = document.getElementById('qbUploadModalBackdrop');
    const closeQbModalBtn = document.getElementById('closeQbModalBtn');
    const cancelQbModalBtn = document.getElementById('cancelQbModalBtn');
    const qbUploadForm = document.getElementById('qbUploadForm');
    const qbModalItemSelect = document.getElementById('qbModalItemSelect');
    const qbModalFileInput = document.getElementById('qbModalFileInput');
    const qbModalFileNameDisplay = document.getElementById('qbModalFileNameDisplay');
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    const uploadBtnText = document.getElementById('uploadBtnText');

    function updateUploadBtnUI() {
        const isAdminMode = checkIsAdmin();

        const addUnitBtn = document.getElementById('addUnitBtn');
        if (addUnitBtn) {
            addUnitBtn.style.display = isAdminMode ? 'inline-block' : 'none';
        }

        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn) {
            publishBtn.style.display = isAdminMode ? 'flex' : 'none';
        }

        const uploadFileBtn = document.getElementById('uploadFileBtn');
        if (uploadFileBtn) {
            uploadFileBtn.style.display = isAdminMode ? 'inline-flex' : 'none';
        }

        if (uploadBtnText) {
            if (isQB) {
                uploadBtnText.textContent = "Upload QB PDF";
            } else if (isAss) {
                uploadBtnText.textContent = "Upload Assignment PDF";
            } else {
                uploadBtnText.textContent = "Upload Notes PDF";
            }
        }
    }

    function openQbUploadModal(defaultType = 'questions') {
        if (!qbUploadModalBackdrop) return;

        if (qbUploadForm) {
            qbUploadForm.reset();
        }

        // Populate unit / chapter select options
        if (qbModalItemSelect) {
            qbModalItemSelect.innerHTML = items.map((item, idx) => `
                <option value="${idx}" ${idx === activeIndex ? 'selected' : ''}>
                    ${item.title}
                </option>
            `).join('');
            qbModalItemSelect.value = activeIndex;
        }

        // Set radio button for document type
        const radios = document.querySelectorAll('input[name="qbUploadDocType"]');
        radios.forEach(r => {
            r.checked = (r.value === defaultType);
        });

        if (qbModalFileNameDisplay) {
            qbModalFileNameDisplay.textContent = "Drag & drop PDF here or click to browse";
        }

        qbUploadModalBackdrop.classList.add('active');
    }

    function closeQbUploadModal() {
        if (!qbUploadModalBackdrop) return;
        qbUploadModalBackdrop.classList.remove('active');
    }

    if (closeQbModalBtn) closeQbModalBtn.addEventListener('click', closeQbUploadModal);
    if (cancelQbModalBtn) cancelQbModalBtn.addEventListener('click', closeQbUploadModal);
    if (qbUploadModalBackdrop) {
        qbUploadModalBackdrop.addEventListener('click', (e) => {
            if (e.target === qbUploadModalBackdrop) closeQbUploadModal();
        });
    }

    if (uploadFileBtn) {
        uploadFileBtn.addEventListener('click', () => {
            if (!checkIsAdmin()) {
                alert("Only administrators can upload files.");
                return;
            }
            if (isQB) {
                openQbUploadModal(currentQBView);
            } else {
                fileUploadInput.click();
            }
        });
    }

    if (qbModalFileInput && qbModalFileNameDisplay) {
        qbModalFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                qbModalFileNameDisplay.textContent = '📄 ' + e.target.files[0].name;
            }
        });
    }

    if (qbUploadForm) {
        qbUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const targetIndex = parseInt(qbModalItemSelect.value, 10);
            const selectedDocType = document.querySelector('input[name="qbUploadDocType"]:checked')?.value || 'questions';
            const file = qbModalFileInput.files[0];

            if (!file) {
                alert("Please select a PDF file to upload.");
                return;
            }

            const submitBtn = qbUploadForm.querySelector('button[type="submit"]');
            const origHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading to Cloud...';
            }

            try {
                showToast(`Uploading "${file.name}" to cloud storage...`);
                const unitId = items[targetIndex] ? items[targetIndex].id : `unit_${targetIndex}`;
                const subFolder = isQB ? `question_bank/${subjectKey}/${unitId}/${selectedDocType}` : `notes/${subjectKey}/${unitId}`;
                const fileName = `${subFolder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

                const { error: err } = await window.supabaseClient.storage
                    .from('academic-files')
                    .upload(fileName, file, { contentType: file.type || 'application/pdf', cacheControl: '3600', upsert: true });

                if (err) throw err;

                const { data: urlData } = window.supabaseClient.storage.from('academic-files').getPublicUrl(fileName);

                const docData = {
                    name: file.name,
                    size: file.size,
                    type: file.type || 'application/pdf',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    data: urlData.publicUrl
                };

                const storageKey = getStorageKey(targetIndex, selectedDocType);
                localStorage.setItem(storageKey, JSON.stringify(docData));
                closeQbUploadModal();

                activeIndex = targetIndex;
                currentQBView = selectedDocType;
                renderItemList(chapterSearchInput.value);
                loadItemContent(activeIndex);

                const targetTitle = items[targetIndex] ? items[targetIndex].title : (isQB ? 'Question Bank' : 'Unit Notes');
                showToast(`${selectedDocType === 'questions' ? 'Question Paper' : 'Model Answer'} PDF uploaded to Cloud & attached to ${targetTitle}!`);

                await autoPublishState();
            } catch (err) {
                console.error(err);
                alert("Error uploading file to cloud storage: " + (err.message || err));
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origHtml;
                }
            }
        });
    }

    function detectCategoryFromFileName(fileName) {
        const name = String(fileName || '').toLowerCase();
        if (name.includes('assignment') || name.includes('ass_') || name.includes('sol_')) {
            return 'assignments';
        }
        if (name.includes('question') || name.includes('qb') || name.includes('bank') || name.includes('paper') || name.includes('exam')) {
            return 'qb';
        }
        if (name.includes('note') || name.includes('study') || name.includes('unit') || name.includes('ch')) {
            return 'notes';
        }
        return null;
    }

    async function handleFileSelection(file) {
        if (!file) return;

        try {
            const detectedCat = detectCategoryFromFileName(file.name);
            const catLabel = detectedCat ? (detectedCat === 'qb' ? 'Question Bank' : (detectedCat === 'assignments' ? 'Assignments' : 'Study Notes')) : (isQB ? 'Question Bank' : 'Study Notes');
            showToast(`Categorizing & Uploading "${file.name}" to ${catLabel}...`);

            // Upload to Unit-wise Supabase Storage Folder
            const targetSubFolder = detectedCat === 'assignments' ? 'assignments' : (detectedCat === 'qb' ? 'question_bank' : (detectedCat === 'notes' ? 'notes' : (isQB ? 'question_bank' : 'notes')));
            const unitId = items[activeIndex] ? items[activeIndex].id : `unit_${activeIndex}`;
            const currentView = isQB ? currentQBView : 'notes';
            const subFolder = `${targetSubFolder}/${subjectKey}/${unitId}/${currentView}`;
            const fileName = `${subFolder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

            const formData = new FormData();
            formData.append('path', fileName);
            formData.append('file', file);
            const token = window.authService ? window.authService.getToken() : localStorage.getItem('enh_auth_token');
            const apiUrl = typeof window.getApiUrl === 'function' ? window.getApiUrl('/api/assignments/upload') : '/api/assignments/upload';

            const uploadRes = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + (token || '')
                },
                body: formData
            });

            if (!uploadRes.ok) {
                const uploadErrJson = await uploadRes.json().catch(() => ({ message: 'Upload failed' }));
                throw new Error(uploadErrJson.message || 'File upload failed');
            }

            const uploadResData = await uploadRes.json();
            const publicUrl = uploadResData.publicUrl || (window.supabaseClient ? window.supabaseClient.storage.from('academic-files').getPublicUrl(fileName).data.publicUrl : '');

            const docData = {
                name: file.name,
                size: file.size,
                type: file.type || 'application/pdf',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                data: publicUrl,
                category: catLabel
            };

            const storageKey = getStorageKey(activeIndex, isQB ? currentQBView : null);
            localStorage.setItem(storageKey, JSON.stringify(docData));
            renderItemList(chapterSearchInput.value);
            loadItemContent(activeIndex);
            showToast(`File "${file.name}" categorized as ${catLabel} & uploaded!`);

            await autoPublishState();
        } catch (err) {
            console.error(err);
            alert("Error uploading file to cloud storage. Please try again.");
        }
    }

    // File Input Change Listener
    fileUploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
        fileUploadInput.value = '';
    });

    // Download Active File Handler
    const downloadFileBtn = document.getElementById('downloadFileBtn');
    const downloadBtnText = document.getElementById('downloadBtnText');

    function updateDownloadBtnUI() {
        if (!downloadBtnText) return;
        if (isQB) {
            if (currentQBView === 'questions') {
                downloadBtnText.textContent = "Download Question PDF";
            } else {
                downloadBtnText.textContent = "Download Answer PDF";
            }
        } else {
            downloadBtnText.textContent = "Download Notes PDF";
        }
        updateUploadBtnUI();
    }

    function handleDownloadActiveFile() {
        const currentItem = items[activeIndex];
        if (!currentItem) return;

        const storageKey = getStorageKey(activeIndex, isQB ? currentQBView : null);
        const storedDocJSON = localStorage.getItem(storageKey);

        if (storedDocJSON) {
            // Download user-uploaded custom file
            const docData = JSON.parse(storedDocJSON);
            const a = document.createElement('a');
            a.href = docData.data;
            a.download = docData.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast(`Downloading ${docData.name}...`);
        } else {
            // Generate & download document file for built-in Question/Answer/Notes
            let fileTitle = "";
            let contentText = "";

            if (isQB) {
                if (currentQBView === 'questions') {
                    fileTitle = `${currentItem.title}_Questions.txt`;
                    contentText = `========================================================================\n` +
                        `${subjectData.title} - QUESTION PAPER\n` +
                        `${currentItem.title}\n` +
                        `Semester: ${subjectData.semester} | Time: 2 Hours | Max Marks: 50\n` +
                        `========================================================================\n\n` +
                        `SECTION A: Short Answer Questions (20 Marks)\n` +
                        `------------------------------------------------------------------------\n` +
                        `Q1. Define ${currentItem.name || 'key concepts'}. Explain memory representation and structural operations with algorithm complexity.\n\n` +
                        `Q2. Differentiate between linear and non-linear memory allocation with suitable C++ examples.\n\n\n` +
                        `SECTION B: Long Answer Questions & Applications (30 Marks)\n` +
                        `------------------------------------------------------------------------\n` +
                        `Q3. Write a complete C++ class implementation to solve real-world problem statement for ${currentItem.name || 'the given topic'}. Include constructors, destructors, and member functions.\n\n` +
                        `Q4. Analyze best-case, average-case, and worst-case time complexities with step-by-step trace diagrams.\n\n` +
                        `========================================================================\n` +
                        `Engineering Notes Hub - Built for NMIET Students\n` +
                        `========================================================================\n`;
                } else {
                    fileTitle = `${currentItem.title}_Model_Solutions.txt`;
                    contentText = `========================================================================\n` +
                        `${subjectData.title} - MODEL SOLUTIONS & ANSWER KEY\n` +
                        `${currentItem.title}\n` +
                        `Semester: ${subjectData.semester} | Official Answer Key\n` +
                        `========================================================================\n\n` +
                        `SOLUTION Q1:\n` +
                        `------------------------------------------------------------------------\n` +
                        `Explanation: ${currentItem.name || 'Concept'} allows structured memory management.\n` +
                        `Time Complexity: O(1) for direct lookup, O(N) for sequential traversal.\n\n` +
                        `C++ Code Implementation:\n` +
                        `#include <iostream>\n` +
                        `using namespace std;\n\n` +
                        `int main() {\n` +
                        `    cout << "Solution for ${currentItem.name || 'Question 1'}" << endl;\n` +
                        `    return 0;\n` +
                        `}\n\n\n` +
                        `SOLUTION Q2:\n` +
                        `------------------------------------------------------------------------\n` +
                        `Comparison: Contiguous memory allocation vs node-based dynamic references.\n` +
                        `Dynamic allocation avoids fixed memory limits but introduces pointer overhead.\n\n` +
                        `========================================================================\n` +
                        `Engineering Notes Hub - Built for NMIET Students\n` +
                        `========================================================================\n`;
                }
            } else {
                fileTitle = `${currentItem.title}_Study_Notes.txt`;
                contentText = `========================================================================\n` +
                    `${subjectData.title} - STUDY NOTES\n` +
                    `${currentItem.title}\n` +
                    `Semester: ${subjectData.semester}\n` +
                    `========================================================================\n\n` +
                    `MODULE OVERVIEW:\n` +
                    `${currentItem.name || currentItem.title}\n\n` +
                    `KEY TOPICS & STUDY GUIDELINES:\n` +
                    `1. Fundamentals & Core Architecture\n` +
                    `2. Standard Operating Principles & Methods\n` +
                    `3. Code Implementation & Real-World Examples\n\n` +
                    `========================================================================\n` +
                    `Engineering Notes Hub - Built for NMIET Students\n` +
                    `========================================================================\n`;
            }

            const blob = new Blob([contentText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileTitle;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`Downloading ${fileTitle}...`);
        }
    }

    if (downloadFileBtn) {
        downloadFileBtn.addEventListener('click', handleDownloadActiveFile);
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
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    function customConfirm(message) {
        if (typeof window.customConfirm === 'function') {
            return window.customConfirm(message);
        }
        return Promise.resolve(confirm(message));
    }

    // 8. Pagination (Prev / Next Item)
    function updatePagination(index) {
        if (index > 0 && items[index - 1]) {
            prevChapterBtn.disabled = false;
            prevChapterTitle.textContent = items[index - 1].title;
        } else {
            prevChapterBtn.disabled = true;
            prevChapterTitle.textContent = 'None';
        }

        if (index < items.length - 1 && items[index + 1]) {
            nextChapterBtn.disabled = false;
            nextChapterTitle.textContent = items[index + 1].title;
        } else {
            nextChapterBtn.disabled = true;
            nextChapterTitle.textContent = 'End of List';
        }
    }

    prevChapterBtn.addEventListener('click', () => {
        if (activeIndex > 0) {
            activeIndex--;
            renderItemList(chapterSearchInput.value);
            loadItemContent(activeIndex);
        }
    });

    nextChapterBtn.addEventListener('click', () => {
        if (activeIndex < items.length - 1) {
            activeIndex++;
            renderItemList(chapterSearchInput.value);
            loadItemContent(activeIndex);
        }
    });

    // 9. Chapter Search / Filter
    chapterSearchInput.addEventListener('input', (e) => {
        renderItemList(e.target.value);
    });

    // 10. Print Control
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // 11. Mobile Drawer Navigation
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', () => {
            sidebarPanel.classList.toggle('open');
            sidebarBackdrop.classList.toggle('active');
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => {
            sidebarPanel.classList.remove('open');
            sidebarBackdrop.classList.remove('active');
        });
    }

    // 8. Add/Edit Unit/Topic functionality for Admins
    const addUnitBtn = document.getElementById('addUnitBtn');
    if (addUnitBtn) {
        addUnitBtn.addEventListener('click', () => {
            if (!checkIsAdmin()) {
                if (document.getElementById('adminToggleBtn')) {
                    document.getElementById('adminToggleBtn').click();
                } else {
                    alert('Please login as Admin to add new units.');
                }
                return;
            }
            openUnitModal(null);
        });
    }

    const unitModalBackdrop = document.getElementById('unitModalBackdrop');
    const closeUnitModalBtn = document.getElementById('closeUnitModalBtn');
    const cancelUnitModalBtn = document.getElementById('cancelUnitModalBtn');
    const unitForm = document.getElementById('unitForm');

    function openUnitModal(index = null) {
        if (!unitModalBackdrop) return;
        const isEdit = index !== null;
        const titleEl = document.getElementById('unitModalTitle');
        const indexEl = document.getElementById('unitModalIndex');
        const titleInput = document.getElementById('unitModalTitleInput');
        const nameInput = document.getElementById('unitModalNameInput');

        if (titleEl) titleEl.textContent = isEdit ? 'Edit Unit' : 'Add New Unit';
        if (indexEl) indexEl.value = isEdit ? index : '';
        if (isEdit && items[index]) {
            if (titleInput) titleInput.value = items[index].title || '';
            if (nameInput) nameInput.value = items[index].name || '';
        } else {
            if (titleInput) titleInput.value = '';
            if (nameInput) nameInput.value = '';
        }
        unitModalBackdrop.classList.add('active');
        unitModalBackdrop.style.display = 'flex';
    }

    function closeUnitModal() {
        if (unitModalBackdrop) {
            unitModalBackdrop.classList.remove('active');
            unitModalBackdrop.style.display = 'none';
        }
    }

    if (closeUnitModalBtn) closeUnitModalBtn.addEventListener('click', closeUnitModal);
    if (cancelUnitModalBtn) cancelUnitModalBtn.addEventListener('click', closeUnitModal);
    if (unitModalBackdrop) {
        unitModalBackdrop.addEventListener('click', (e) => {
            if (e.target === unitModalBackdrop) closeUnitModal();
        });
    }

    if (unitForm) {
        unitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('unitModalTitleInput');
            const nameInput = document.getElementById('unitModalNameInput');
            const indexEl = document.getElementById('unitModalIndex');

            const title = titleInput ? titleInput.value.trim() : '';
            const name = nameInput ? nameInput.value.trim() : '';
            const indexVal = indexEl ? indexEl.value : '';
            if (!title) return;

            const customItemsKey = `custom_items_${subjectKey}_${resourceType}`;
            const modifiedItemsKey = `modified_items_${subjectKey}_${resourceType}`;
            let customItems = JSON.parse(localStorage.getItem(customItemsKey)) || [];
            let modifiedItems = JSON.parse(localStorage.getItem(modifiedItemsKey)) || {};

            if (indexVal !== '') {
                const idx = parseInt(indexVal, 10);
                if (items[idx]) {
                    items[idx].title = title;
                    items[idx].name = name;

                    const customIdx = customItems.findIndex(ci => ci.id === items[idx].id);
                    if (customIdx >= 0) {
                        customItems[customIdx].title = title;
                        customItems[customIdx].name = name;
                        localStorage.setItem(customItemsKey, JSON.stringify(customItems));
                    } else {
                        modifiedItems[items[idx].id] = { title, name };
                        localStorage.setItem(modifiedItemsKey, JSON.stringify(modifiedItems));
                    }
                    syncSaveUnitMod(subjectKey, idx, items[idx], title, name);
                    if (typeof showToast === 'function') showToast(`${itemSingular} updated successfully!`);
                }
            } else {
                const newId = `${subjectKey}-${isQB ? 'qb' : 'u'}${items.length + 1}-${Date.now()}`;
                const newItem = { id: newId, title: title, unit: `Unit ${items.length + 1}`, name: name };
                items.push(newItem);
                customItems.push(newItem);
                localStorage.setItem(customItemsKey, JSON.stringify(customItems));
                if (typeof showToast === 'function') showToast(`New ${itemSingular} added successfully!`);
                activeIndex = items.length - 1;
            }

            chapterCount.textContent = `${items.length} ${items.length === 1 ? itemSingular : itemPlural}`;
            renderItemList(chapterSearchInput ? chapterSearchInput.value : '');

            if (indexVal === '' || parseInt(indexVal, 10) === activeIndex) {
                loadItemContent(activeIndex);
            }
            closeUnitModal();
            try {
                await autoPublishState();
            } catch (err) { }
        });
    }

    function autoPublishState() {
        if (typeof window.markUnpublishedChanges === 'function') {
            window.markUnpublishedChanges();
        }
    }

    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
            const isAdmin = checkIsAdmin();

            if (!isAdmin) {
                showToast('Please login as Admin to publish changes to all users!', true);
                if (document.getElementById('adminToggleBtn')) {
                    document.getElementById('adminToggleBtn').click();
                }
                return;
            }

            publishBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Publishing...</span>`;
            publishBtn.disabled = true;

            try {
                await autoPublishState();
                if (typeof showToast === 'function') {
                    showToast('Changes published successfully to all users!');
                } else {
                    alert('Changes published successfully!');
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to publish changes: ' + (err.message || err), true);
            } finally {
                publishBtn.innerHTML = `<i class="fa-solid fa-earth-americas"></i><span>Publish</span>`;
                publishBtn.disabled = false;
            }
        });
    }

    // Initial Load & Synchronous UI Render
    function refreshDataAndUI() {
        if (typeof window.loadCustomSubjectsIntoData === 'function') {
            window.loadCustomSubjectsIntoData();
        }

        const currentSubject = subjectsData[subjectKey] || subjectData;
        if (subjectHeading && currentSubject) {
            subjectHeading.textContent = currentSubject.title;
        }

        // Re-sync items from localStorage if custom items changed
        const customItemsKey = `custom_items_${subjectKey}_${resourceType}`;
        const modifiedItemsKey = `modified_items_${subjectKey}_${resourceType}`;
        const customItems = JSON.parse(localStorage.getItem(customItemsKey)) || [];
        const modifiedItems = JSON.parse(localStorage.getItem(modifiedItemsKey)) || {};

        // Clear and rebuild items
        items.length = 0;
        let rawDefaults = [];
        if (isQB) {
            rawDefaults = currentSubject.questionBanks || currentSubject.chapters || [];
        } else if (isAss) {
            rawDefaults = currentSubject.assignments || currentSubject.chapters || [];
        } else {
            rawDefaults = currentSubject.chapters || [];
        }
        items.push(...JSON.parse(JSON.stringify(rawDefaults)));
        if (customItems.length > 0) {
            items.push(...customItems);
        }

        if (!items || items.length === 0) {
            items.push(
                { id: `${subjectKey}-u1`, title: "Unit 1: Fundamentals & Concepts", unit: "Unit 1", name: "Fundamentals & Concepts" },
                { id: `${subjectKey}-u2`, title: "Unit 2: Core Architecture & Methods", unit: "Unit 2", name: "Core Architecture & Methods" },
                { id: `${subjectKey}-u3`, title: "Unit 3: Advanced Operations", unit: "Unit 3", name: "Advanced Operations" },
                { id: `${subjectKey}-u4`, title: "Unit 4: Applications & Implementation", unit: "Unit 4", name: "Applications & Implementation" }
            );
        }

        items.forEach(item => {
            if (modifiedItems[item.id]) {
                item.title = modifiedItems[item.id].title;
                item.name = modifiedItems[item.id].name;
            }
        });
        chapterCount.textContent = `${items.length} ${items.length === 1 ? itemSingular : itemPlural}`;

        let initialIndex = activeIndex || 0;
        try {
            const savedIndex = parseInt(sessionStorage.getItem(`active_index_${subjectKey}_${resourceType}`), 10);
            if (!isNaN(savedIndex) && items[savedIndex]) {
                initialIndex = savedIndex;
            }
        } catch (e) { }

        updateUploadBtnUI();
        renderItemList(chapterSearchInput ? chapterSearchInput.value : '');
        loadItemContent(initialIndex);
    }

    async function syncCloudState() {
        if (!window.supabaseClient) return;
        const fileNames = [
            `published_state/${subjectKey}_${resourceType}_state.json`,
            `published_state/app_data.json`
        ];

        let updated = false;
        for (const fileName of fileNames) {
            try {
                const { data: urlData } = window.supabaseClient.storage.from('academic-files').getPublicUrl(fileName);
                const res = await fetch(urlData.publicUrl + '?t=' + Date.now());
                if (res.ok) {
                    const publishedData = await res.json();

                    let cloudDeleted = [];
                    try { cloudDeleted = JSON.parse(publishedData['deleted_keys_global'] || '[]'); } catch (e) { }
                    let localDeleted = [];
                    try { localDeleted = JSON.parse(localStorage.getItem('deleted_keys_global') || '[]'); } catch (e) { }
                    const mergedDeleted = Array.from(new Set([...cloudDeleted, ...localDeleted]));
                    localStorage.setItem('deleted_keys_global', JSON.stringify(mergedDeleted));

                    mergedDeleted.forEach(delKey => {
                        localStorage.removeItem(delKey);
                    });

                    for (const key in publishedData) {
                        if (!mergedDeleted.includes(key)) {
                            localStorage.setItem(key, publishedData[key]);
                        }
                    }
                    updated = true;
                }
            } catch (e) { }
        }

        if (updated) {
            refreshDataAndUI();
        }
    }

    let activePdfMode = 'normal';

    function setPdfViewMode(mode) {
        activePdfMode = mode;
        const body = document.body;
        const docCard = document.querySelector('.uploaded-document-card') || document.getElementById('notesDocument');

        body.classList.remove('full-site-mode');

        if (mode === 'normal') {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            }
        } else if (mode === 'fullsite') {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            }
            body.classList.add('full-site-mode');
        } else if (mode === 'fullscreen') {
            if (docCard) {
                if (docCard.requestFullscreen) {
                    docCard.requestFullscreen().catch(() => { });
                } else if (docCard.webkitRequestFullscreen) {
                    docCard.webkitRequestFullscreen();
                } else if (docCard.msRequestFullscreen) {
                    docCard.msRequestFullscreen();
                }
            }
        }

        document.querySelectorAll('.pdf-mode-btn').forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        try { localStorage.setItem('pdfViewMode', mode); } catch (e) { }
    }

    function initPdfViewModeSwitcher() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.pdf-mode-btn');
            if (btn && btn.dataset.mode) {
                setPdfViewMode(btn.dataset.mode);
            }
        });

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                if (activePdfMode === 'fullscreen') {
                    setPdfViewMode('normal');
                }
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        const savedMode = localStorage.getItem('pdfViewMode');
        if (savedMode && ['normal', 'fullsite', 'fullscreen'].includes(savedMode)) {
            if (savedMode !== 'fullscreen') {
                setPdfViewMode(savedMode);
            }
        }
    }

    function initSidebarToggle() {
        const sidebarPanel = document.getElementById('sidebarPanel');
        const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
        const toggleSidebarDesktopBtn = document.getElementById('toggleSidebarDesktopBtn');
        const toggleSidebarCollapseBtn = document.getElementById('toggleSidebarCollapseBtn');
        const toggleSidebarText = document.getElementById('toggleSidebarText');
        const toggleSidebarIcon = document.getElementById('toggleSidebarIcon');

        function toggleSidebar(e) {
            if (e) e.stopPropagation();
            if (!sidebarPanel) return;
            const isOpen = sidebarPanel.classList.toggle('open');
            const isCollapsed = sidebarPanel.classList.toggle('collapsed', !isOpen);
            localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
            if (toggleSidebarText) {
                toggleSidebarText.textContent = isCollapsed ? 'Show Sidebar' : 'Hide Sidebar';
            }
            if (toggleSidebarIcon) {
                toggleSidebarIcon.className = isCollapsed ? 'fa-solid fa-bars' : 'fa-solid fa-bars-staggered';
            }
        }

        if (mobileSidebarToggle) {
            mobileSidebarToggle.addEventListener('click', toggleSidebar);
        }
        if (toggleSidebarDesktopBtn) {
            toggleSidebarDesktopBtn.addEventListener('click', toggleSidebar);
        }
        if (toggleSidebarCollapseBtn) {
            toggleSidebarCollapseBtn.addEventListener('click', toggleSidebar);
        }

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900 && sidebarPanel && sidebarPanel.classList.contains('open')) {
                if (!sidebarPanel.contains(e.target) && (!mobileSidebarToggle || !mobileSidebarToggle.contains(e.target)) && (!toggleSidebarDesktopBtn || !toggleSidebarDesktopBtn.contains(e.target))) {
                    sidebarPanel.classList.remove('open');
                    sidebarPanel.classList.add('collapsed');
                }
            }
        });

        if (localStorage.getItem('sidebarCollapsed') === 'true' && sidebarPanel && window.innerWidth > 900) {
            sidebarPanel.classList.add('collapsed');
            if (toggleSidebarText) toggleSidebarText.textContent = 'Show Sidebar';
            if (toggleSidebarIcon) toggleSidebarIcon.className = 'fa-solid fa-bars';
        }
    }


    async function init() {
        initSidebarToggle();
        initPdfViewModeSwitcher();

        const itemListEl = document.getElementById('chapterList') || document.getElementById('notesDocument');
        if (itemListEl) {
            itemListEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top: 10px;">Loading latest notes from Supabase...</p></div>';
        }

        if (window.supabaseRealtime && window.supabaseRealtime.pullLatest) {
            try {
                await window.supabaseRealtime.pullLatest();
            } catch (e) {
                console.warn('Initial cloud pull:', e);
            }
        }

        refreshDataAndUI();

        if (window.supabaseRealtime) {
            window.supabaseRealtime.subscribe(() => {
                refreshDataAndUI();
            });
        }
    }

    window.addEventListener('auth_state_changed', () => {
        updateUploadBtnUI();
        renderItemList(chapterSearchInput ? chapterSearchInput.value : '');
    });

    init();
});
