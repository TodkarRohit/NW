// Engineering Notes Hub - Study Notes Viewer & Upload Management Script

document.addEventListener('DOMContentLoaded', () => {
    // 1. Parse URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const subjectKey = urlParams.get('subject') || 'dsa';

    // 2. Load Subject Data
    const subjectData = subjectsData[subjectKey] || subjectsData['dsa'];

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
    const uploadFileBtn = document.getElementById('uploadFileBtn');

    const prevChapterBtn = document.getElementById('prevChapterBtn');
    const nextChapterBtn = document.getElementById('nextChapterBtn');
    const prevChapterTitle = document.getElementById('prevChapterTitle');
    const nextChapterTitle = document.getElementById('nextChapterTitle');

    const printBtn = document.getElementById('printBtn');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebarPanel = document.getElementById('sidebarPanel');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');

    // 4. Update Header Meta
    subjectHeading.textContent = subjectData.title;
    resourceTypeBadge.textContent = "Study Notes";
    sidebarSectionTitle.textContent = "Chapter List";

    document.title = `${subjectData.title} - Study Notes | Engineering Notes Hub`;

    const items = subjectData.chapters || [];
    chapterCount.textContent = `${items.length} ${items.length === 1 ? 'Chapter' : 'Chapters'}`;

    let activeIndex = 0;

    // Helper: Local Storage Key for Persisted Uploads
    function getStorageKey(itemIndex) {
        return `doc_upload_${subjectKey}_notes_${items[itemIndex].id}`;
    }

    // 5. Render Sidebar Items List
    function renderItemList(filterText = '') {
        chapterList.innerHTML = '';
        const searchLower = filterText.toLowerCase();

        items.forEach((item, index) => {
            const matches = item.title.toLowerCase().includes(searchLower) ||
                            (item.name && item.name.toLowerCase().includes(searchLower));

            if (matches) {
                const storedFile = localStorage.getItem(getStorageKey(index));
                const itemBtn = document.createElement('button');
                itemBtn.className = `chapter-item ${index === activeIndex ? 'active' : ''}`;
                itemBtn.setAttribute('type', 'button');
                
                itemBtn.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                        <span class="chapter-item-title">${item.title}</span>
                        ${storedFile ? `<span style="font-size: 0.7rem; background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: 700; white-space: nowrap;">Uploaded</span>` : ''}
                    </div>
                `;

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
            chapterList.innerHTML = `<div style="padding: 1.5rem 1rem; color: #94a3b8; font-size: 0.9rem; text-align: center;">No matching chapters found</div>`;
        }
    }

    // 6. Load Item Content / Upload Structure
    function loadItemContent(index) {
        if (!items[index]) return;

        const currentItem = items[index];
        currentChapterName.textContent = currentItem.title;

        // Check if an uploaded document exists for this item
        const storedDocJSON = localStorage.getItem(getStorageKey(index));
        
        if (storedDocJSON) {
            const docData = JSON.parse(storedDocJSON);
            itemUploadStatus.className = "status-indicator uploaded";
            statusText.textContent = "Document Attached";

            notesDocument.innerHTML = `
                <div class="structure-header">
                    <h2>${currentItem.title}</h2>
                    <p>${subjectData.title} &bull; Study Notes</p>
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
                            <button class="doc-action-btn" id="reUploadBtn">Replace File</button>
                            <button class="doc-action-btn delete-btn" id="deleteDocBtn">Remove</button>
                        </div>
                    </div>

                    <div class="doc-preview-body">
                        ${docData.type.startsWith('image/') ? `
                            <img src="${docData.data}" alt="Notes Preview" style="max-width: 100%; max-height: 480px; object-fit: contain; border-radius: 6px;">
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
                    <h4>📋 Chapter Information</h4>
                    <div class="outline-sections-grid">
                        <div class="outline-item"><span class="outline-item-num">01</span> ${currentItem.name || currentItem.title}</div>
                        <div class="outline-item"><span class="outline-item-num">02</span> Subject: ${subjectData.title}</div>
                        <div class="outline-item"><span class="outline-item-num">03</span> Semester: ${subjectData.semester}</div>
                        <div class="outline-item"><span class="outline-item-num">04</span> Status: Active Notes</div>
                    </div>
                </div>
            `;

            // Attach replace & delete events
            document.getElementById('reUploadBtn').addEventListener('click', () => fileUploadInput.click());
            document.getElementById('deleteDocBtn').addEventListener('click', () => {
                if (confirm(`Remove uploaded file for ${currentItem.title}?`)) {
                    localStorage.removeItem(getStorageKey(index));
                    renderItemList(chapterSearchInput.value);
                    loadItemContent(index);
                }
            });

        } else {
            // Clean Upload / Outline Blueprint Structure
            itemUploadStatus.className = "status-indicator";
            statusText.textContent = "Ready for Upload";

            notesDocument.innerHTML = `
                <div class="structure-header">
                    <h2>${currentItem.title}</h2>
                    <p>${subjectData.title} &bull; Study Notes</p>
                </div>

                <!-- Interactive Upload Dropzone Structure -->
                <div class="upload-dropzone" id="dropzoneBox">
                    <div class="upload-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </div>
                    <h3>Upload Study Notes</h3>
                    <p>Click here or drag & drop your study notes or PDF document for <strong>${currentItem.title}</strong>.</p>
                    <div class="upload-action-pill">Choose File (PDF, DOCX, TXT, Images)</div>
                </div>

                <!-- Structured Outline Layout -->
                <div class="document-outline-card">
                    <h4>📋 Chapter Information</h4>
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

        // Scroll to top
        const previewPanel = document.getElementById('previewPanel');
        previewPanel.scrollTo({ top: 0, behavior: 'smooth' });

        // Update Pagination
        updatePagination(index);
    }

    // 7. Handle File Upload Selection
    function handleFileSelection(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const docData = {
                name: file.name,
                size: file.size,
                type: file.type,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                data: e.target.result
            };

            try {
                localStorage.setItem(getStorageKey(activeIndex), JSON.stringify(docData));
                renderItemList(chapterSearchInput.value);
                loadItemContent(activeIndex);
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
    });

    uploadFileBtn.addEventListener('click', () => {
        fileUploadInput.click();
    });

    // 8. Pagination (Prev / Next Item)
    function updatePagination(index) {
        if (index > 0) {
            prevChapterBtn.disabled = false;
            prevChapterTitle.textContent = items[index - 1].title;
        } else {
            prevChapterBtn.disabled = true;
            prevChapterTitle.textContent = 'None';
        }

        if (index < items.length - 1) {
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

    // Initial Load
    renderItemList();
    loadItemContent(0);
});
