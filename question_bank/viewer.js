// Engineering Notes Hub - Resource Viewer & Upload Management Script

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 0. Theme Management (Dark / Light Mode)
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

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    initTheme();

    // 1. Parse URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    let subjectKey = urlParams.get('subject') || 'dsa';
    const resourceType = urlParams.get('type') === 'qb' ? 'qb' : 'notes';
    const isQB = resourceType === 'qb';

    // Set data-resource on body for scoped theme styling (notes vs qb)
    document.body.setAttribute('data-resource', isQB ? 'qb' : 'notes');

    // 2. Load Subject Data with Fallback
    if (!subjectsData[subjectKey]) {
        subjectKey = 'dsa';
    }
    const subjectData = subjectsData[subjectKey];

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

    // Quick Switcher Links
    const tabNotesLink = document.getElementById('tabNotesLink');
    const tabQbLink = document.getElementById('tabQbLink');
    const tabAssLink = document.getElementById('tabAssLink');

    if (tabNotesLink) {
        tabNotesLink.href = `../notes/viewer.html?subject=${subjectKey}&type=notes`;
        if (!isQB) tabNotesLink.classList.add('active');
        else tabNotesLink.classList.remove('active');
    }
    if (tabQbLink) {
        tabQbLink.href = `viewer.html?subject=${subjectKey}&type=qb`;
        if (isQB) tabQbLink.classList.add('active');
        else tabQbLink.classList.remove('active');
    }
    if (tabAssLink) {
        tabAssLink.href = `../assignments/assignments.html?subject=${subjectKey}`;
    }

    // 4. Update Header Meta
    const typeLabel = isQB ? "Question Banks" : "Study Notes";
    const itemSingular = isQB ? "Question Bank" : "Chapter";
    const itemPlural = isQB ? "Question Banks" : "Chapters";

    subjectHeading.textContent = subjectData.title;
    resourceTypeBadge.textContent = typeLabel;
    sidebarSectionTitle.textContent = isQB ? "Question Banks" : "Chapter List";

    document.title = `${subjectData.title} - ${typeLabel} | Engineering Notes Hub`;

    const items = isQB ? (subjectData.questionBanks || subjectData.chapters || []) : (subjectData.chapters || []);
    chapterCount.textContent = `${items.length} ${items.length === 1 ? itemSingular : itemPlural}`;

    let activeIndex = 0;
    let currentQBView = 'questions'; // 'questions' or 'answers' for Question Banks

    // Helper: Local Storage Key for Persisted Uploads
    function getStorageKey(itemIndex, viewType = null) {
        if (!items[itemIndex]) return `doc_upload_${subjectKey}_${resourceType}_default`;
        if (isQB) {
            const targetView = viewType || currentQBView;
            const qbKey = `doc_upload_${subjectKey}_qb_${items[itemIndex].id}_${targetView}`;
            if (localStorage.getItem(qbKey)) return qbKey;
            if (targetView === 'questions') {
                const legacyKey = `doc_upload_${subjectKey}_qb_${items[itemIndex].id}`;
                if (localStorage.getItem(legacyKey)) return legacyKey;
            }
            return qbKey;
        }
        return `doc_upload_${subjectKey}_${resourceType}_${items[itemIndex].id}`;
    }

    // 5. Render Sidebar Items List
    function renderItemList(filterText = '') {
        chapterList.innerHTML = '';
        const searchLower = filterText.toLowerCase();

        items.forEach((item, index) => {
            const matches = item.title.toLowerCase().includes(searchLower) ||
                            (item.name && item.name.toLowerCase().includes(searchLower));

            if (matches) {
                let uploadedFiles = [];
                if (isQB) {
                    const qDataStr = localStorage.getItem(getStorageKey(index, 'questions'));
                    const aDataStr = localStorage.getItem(getStorageKey(index, 'answers'));
                    if (qDataStr) {
                        try { uploadedFiles.push(JSON.parse(qDataStr)); } catch(e){}
                    }
                    if (aDataStr) {
                        try { uploadedFiles.push(JSON.parse(aDataStr)); } catch(e){}
                    }
                } else {
                    const nDataStr = localStorage.getItem(getStorageKey(index));
                    if (nDataStr) {
                        try { uploadedFiles.push(JSON.parse(nDataStr)); } catch(e){}
                    }
                }
                const hasDoc = uploadedFiles.length > 0;

                const itemBtn = document.createElement('div');
                itemBtn.className = `chapter-item-container`;
                itemBtn.style.display = 'flex';
                itemBtn.style.flexDirection = 'column';
                itemBtn.style.gap = '0';
                
                const btnInner = document.createElement('button');
                btnInner.className = `chapter-item ${index === activeIndex ? 'active' : ''}`;
                btnInner.setAttribute('type', 'button');
                btnInner.style.width = '100%';
                
                btnInner.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                        <span class="chapter-item-title">${item.title}</span>
                        ${hasDoc ? `<span style="font-size: 0.7rem; background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: 700; white-space: nowrap;">Uploaded</span>` : ''}
                    </div>
                `;

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

    // 6. Load Item Content / Upload Structure
    function loadItemContent(index) {
        if (!items[index]) return;

        const currentItem = items[index];
        currentChapterName.textContent = currentItem.title;

        // Question Bank Tab Bar HTML
        let qbTabBarHTML = '';
        if (isQB) {
            qbTabBarHTML = `
                <div class="qb-switcher-container">
                    <div class="qb-tab-bar">
                        <button type="button" class="qb-tab-btn question-tab ${currentQBView === 'questions' ? 'active' : ''}" id="qbQuestionTabBtn">
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
                        <button type="button" class="qb-tab-btn answer-tab ${currentQBView === 'answers' ? 'active' : ''}" id="qbAnswerTabBtn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span>ANSWERS</span>
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
            statusText.textContent = isQB ? `${currentQBView === 'questions' ? 'Question' : 'Answer'} PDF Attached` : "Document Attached";

            notesDocument.innerHTML = `
                ${qbTabBarHTML}

                <div class="structure-header">
                    <h2>${currentItem.title} ${isQB ? `(${currentQBView === 'questions' ? 'Question Paper' : 'Answer Key & Solutions'})` : ''}</h2>
                    <p>${subjectData.title} &bull; ${typeLabel}</p>
                </div>

                <div class="uploaded-document-card">
                    <div class="uploaded-doc-header">
                        <div class="doc-info">
                            <div class="doc-file-icon">📄</div>
                            <div>
                                <div class="doc-name">${docData.name}</div>
                                <div class="doc-meta">Uploaded on ${docData.date} &bull; ${(docData.size / 1024).toFixed(1)} KB</div>
                            </div>
                        </div>
                        <div class="doc-actions">
                            <button class="doc-action-btn" id="reUploadBtn">Replace ${isQB ? (currentQBView === 'questions' ? 'Question' : 'Answer') : ''} File</button>
                            <button class="doc-action-btn delete-btn" id="deleteDocBtn">Remove</button>
                        </div>
                    </div>

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
            document.getElementById('reUploadBtn').addEventListener('click', () => fileUploadInput.click());
            document.getElementById('deleteDocBtn').addEventListener('click', () => {
                if (confirm(`Remove uploaded ${isQB ? currentQBView : ''} file for ${currentItem.title}?`)) {
                    localStorage.removeItem(storageKey);
                    renderItemList(chapterSearchInput.value);
                    loadItemContent(index);
                }
            });

        } else if (isQB) {
            // Built-in Question Bank Questions vs Answers Paper View
            itemUploadStatus.className = "status-indicator";
            statusText.textContent = currentQBView === 'questions' ? "Viewing Question Paper" : "Viewing Answer Key";

            const isAdminMode = localStorage.getItem('isAdminMode') === 'true';
            
            const paperViewHTML = currentQBView === 'questions' ? `
                <div class="qb-paper-view question-paper">
                    <div class="paper-header">
                        <div class="paper-badge question-badge">QUESTION PAPER</div>
                        <h3>${currentItem.title}</h3>
                        <p class="paper-sub">${subjectData.title} &bull; ${subjectData.semester} &bull; Time: 2 Hours &bull; Max Marks: 50</p>
                    </div>
                    <div class="paper-section">
                        <h4>SECTION A: Short Answer Questions (20 Marks)</h4>
                        <div class="q-item">
                            <span class="q-num">Q1.</span>
                            <p>Define ${currentItem.name || 'key concepts'}. Explain memory representation and structural operations with algorithm complexity.</p>
                        </div>
                        <div class="q-item">
                            <span class="q-num">Q2.</span>
                            <p>Differentiate between linear and non-linear memory allocation with suitable C++ examples.</p>
                        </div>
                    </div>
                    <div class="paper-section">
                        <h4>SECTION B: Long Answer Questions & Applications (30 Marks)</h4>
                        <div class="q-item">
                            <span class="q-num">Q3.</span>
                            <p>Write a complete C++ class implementation to solve real-world problem statement for ${currentItem.name || 'the given topic'}. Include constructors, destructors, and member functions.</p>
                        </div>
                        <div class="q-item">
                            <span class="q-num">Q4.</span>
                            <p>Analyze best-case, average-case, and worst-case time complexities with step-by-step trace diagrams.</p>
                        </div>
                    </div>
                    ${isAdminMode ? `
                    <div class="upload-pdf-strip">
                        <span>Have your own Question PDF for this unit?</span>
                        <button type="button" class="strip-upload-btn" id="stripUploadQBtn">Upload Question PDF</button>
                    </div>
                    ` : ''}
                </div>
            ` : `
                <div class="qb-paper-view answer-paper">
                    <div class="paper-header">
                        <div class="paper-badge answer-badge">MODEL SOLUTIONS & ANSWER KEY</div>
                        <h3>${currentItem.title} - Detailed Solutions</h3>
                        <p class="paper-sub">${subjectData.title} &bull; ${subjectData.semester} &bull; Official Answer Key</p>
                    </div>
                    <div class="paper-section">
                        <h4>MODEL SOLUTIONS & CODE IMPLEMENTATION</h4>
                        <div class="q-item solution-item">
                            <span class="sol-tag">Solution Q1:</span>
                            <p><strong>Explanation:</strong> ${currentItem.name || 'Concept'} allows structured memory management. Time Complexity: O(1) for direct lookup, O(N) for sequential traversal.</p>
                            <div class="sol-code-block">
                                // C++ Solution Code<br>
                                #include &lt;iostream&gt;<br>
                                using namespace std;<br><br>
                                int main() {<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;cout &lt;&lt; "Solution for ${currentItem.name || 'Question 1'}" &lt;&lt; endl;<br>
                                &nbsp;&nbsp;&nbsp;&nbsp;return 0;<br>
                                }
                            </div>
                        </div>
                        <div class="q-item solution-item">
                            <span class="sol-tag">Solution Q2:</span>
                            <p><strong>Comparison:</strong> Contiguous memory allocation vs node-based dynamic references. Dynamic allocation avoids fixed memory limits but introduces pointer overhead.</p>
                        </div>
                    </div>
                    ${isAdminMode ? `
                    <div class="upload-pdf-strip">
                        <span>Have your own Answer/Solution PDF for this unit?</span>
                        <button type="button" class="strip-upload-btn" id="stripUploadABtn">Upload Answer PDF</button>
                    </div>
                    ` : ''}
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

            const stripQBtn = document.getElementById('stripUploadQBtn');
            const stripABtn = document.getElementById('stripUploadABtn');
            if (stripQBtn) stripQBtn.addEventListener('click', () => openQbUploadModal('questions'));
            if (stripABtn) stripABtn.addEventListener('click', () => openQbUploadModal('answers'));

        } else {
            // Clean Upload / Outline Blueprint Structure for Study Notes
            itemUploadStatus.className = "status-indicator";
            statusText.textContent = "Ready for Upload";
            const isAdminMode = localStorage.getItem('isAdminMode') === 'true';

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
                    <h3>Upload ${typeLabel}</h3>
                    <p>Click here or drag & drop your study notes or PDF document for <strong>${currentItem.title}</strong>.</p>
                    <div class="upload-action-pill">Choose File (PDF, DOCX, TXT, Images)</div>
                </div>
                ` : `
                <div class="upload-dropzone" style="cursor: pointer; background: var(--bg-surface); border-style: dashed; padding: 20px;">
                    <h3 style="color: var(--text-main); margin-bottom: 10px;"><i class="fa-regular fa-file-pdf" style="color: #ef4444;"></i> Module 1 Question Bank.pdf</h3>
                    <p style="color: var(--text-light);">Click to view or download</p>
                </div>
                    <h3 style="color: var(--text-muted);">Admin Upload Only</h3>
                    <p style="color: var(--text-light);">Only authenticated admins can upload study materials here.</p>
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

        // Attach event listeners for QB Questions vs Answers tab buttons if present
        if (isQB) {
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
                    currentQBView = 'answers';
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
        if (!uploadBtnText) return;
        const isAdminMode = localStorage.getItem('isAdminMode') === 'true';
        if (!isAdminMode) {
            if (uploadFileBtn) uploadFileBtn.style.display = 'none';
        } else {
            if (uploadFileBtn) uploadFileBtn.style.display = 'inline-flex';
            if (isQB) {
                uploadBtnText.textContent = "Upload QB PDF";
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
        qbUploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const targetIndex = parseInt(qbModalItemSelect.value, 10);
            const selectedDocType = document.querySelector('input[name="qbUploadDocType"]:checked')?.value || 'questions';
            const file = qbModalFileInput.files[0];

            if (!file) {
                alert("Please select a PDF file to upload.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                const docData = {
                    name: file.name,
                    size: file.size,
                    type: file.type || 'application/pdf',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    data: evt.target.result
                };

                try {
                    const storageKey = getStorageKey(targetIndex, selectedDocType);
                    localStorage.setItem(storageKey, JSON.stringify(docData));
                    closeQbUploadModal();
                    
                    activeIndex = targetIndex;
                    currentQBView = selectedDocType;
                    renderItemList(chapterSearchInput.value);
                    loadItemContent(activeIndex);

                    const targetTitle = items[targetIndex] ? items[targetIndex].title : 'Question Bank';
                    showToast(`${selectedDocType === 'questions' ? 'Question Paper' : 'Model Answer'} PDF attached to ${targetTitle}!`);
                } catch (err) {
                    alert("File size is too large for local storage. Please choose a smaller PDF file.");
                }
            };
            reader.readAsDataURL(file);
        });
    }

    function handleFileSelection(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const docData = {
                name: file.name,
                size: file.size,
                type: file.type || 'application/pdf',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                data: e.target.result
            };

            try {
                const storageKey = getStorageKey(activeIndex, isQB ? currentQBView : null);
                localStorage.setItem(storageKey, JSON.stringify(docData));
                renderItemList(chapterSearchInput.value);
                loadItemContent(activeIndex);
                showToast(`File "${file.name}" uploaded successfully!`);
            } catch (err) {
                alert("File size is large for browser local cache. Please select a smaller PDF, text, or document file.");
            }
        };

        reader.readAsDataURL(file);
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

    function showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
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

    // Initial Load
    renderItemList();
    loadItemContent(0);
});










