document.addEventListener('DOMContentLoaded', () => {
    // Theme Management
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
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    initTheme();

    // Subject Data Definition
    const subjectsData = {
        'dsa': {
            title: 'Data Structure and Algorithm (C++)',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: [
                {
                    id: 'dsa_ass_1',
                    num: 1,
                    title: 'ASSIGNMENT 1: Array Operations & Matrices',
                    questionFile: 'DSA_Assignment_1_Questions.pdf',
                    answerFile: 'DSA_Assignment_1_Solutions.pdf',
                    views: 420,
                    downloads: 185,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Matrix Transpose & Multiplication</div>
                            <p>Write a C++ program to perform 2D Matrix multiplication and find transpose without creating a auxiliary matrix.</p>
                            <div class="pdf-doc-code">
// Input: Matrix A[N][N]<br>
// Output: Transpose A^T
                            </div>
                            <div class="pdf-doc-title" style="margin-top:12px"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q2. Sparse Matrix Representation</div>
                            <p>Implement Triple array representation for sparse matrix and write addition of two sparse matrices.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: C++ Implementation</div>
                            <div class="pdf-doc-code">
#include &lt;iostream&gt;<br>
using namespace std;<br>
void transpose(int mat[3][3]) {<br>
&nbsp;&nbsp;for(int i=0; i&lt;3; i++)<br>
&nbsp;&nbsp;&nbsp;&nbsp;for(int j=i+1; j&lt;3; j++)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;swap(mat[i][j], mat[j][i]);<br>
}
                            </div>
                            <p style="margin-top:8px; font-weight:600; color:#16a34a;">Time Complexity: O(N^2) | Space: O(1)</p>
                        </div>
                    `,
                    comments: [
                        { name: 'Rahul Sharma', text: 'Solutions for Q2 sparse matrix addition are very clear!', date: '2 hours ago' },
                        { name: 'Priya Patel', text: 'Is there an alternative in-place transpose algorithm?', date: '1 day ago' }
                    ]
                },
                {
                    id: 'dsa_ass_2',
                    num: 2,
                    title: 'ASSIGNMENT 2: Linked Lists & Stack Applications',
                    questionFile: 'DSA_Assignment_2_Questions.pdf',
                    answerFile: 'DSA_Assignment_2_Solutions.pdf',
                    views: 310,
                    downloads: 142,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Singly Linked List Inversion</div>
                            <p>Write an iterative and recursive function to reverse a Singly Linked List in place.</p>
                            <div class="pdf-doc-title" style="margin-top:12px"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q2. Infix to Postfix Evaluation</div>
                            <p>Convert the infix expression: <code>A + (B * C - (D / E ^ F) * G) * H</code> to postfix using Stack.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: Reversing Linked List</div>
                            <div class="pdf-doc-code">
Node* reverse(Node* head) {<br>
&nbsp;&nbsp;Node *prev=NULL, *curr=head, *next=NULL;<br>
&nbsp;&nbsp;while(curr) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;next = curr-&gt;next;<br>
&nbsp;&nbsp;&nbsp;&nbsp;curr-&gt;next = prev;<br>
&nbsp;&nbsp;&nbsp;&nbsp;prev = curr; curr = next;<br>
&nbsp;&nbsp;}<br>
&nbsp;&nbsp;return prev;<br>
}
                            </div>
                        </div>
                    `,
                    comments: []
                },
                {
                    id: 'dsa_ass_3',
                    num: 3,
                    title: 'ASSIGNMENT 3: Binary Search Trees & Graph Algorithms',
                    questionFile: 'DSA_Assignment_3_Questions.pdf',
                    answerFile: 'DSA_Assignment_3_Solutions.pdf',
                    views: 289,
                    downloads: 110,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. BST Construction & Inorder Traversal</div>
                            <p>Construct BST from given keys: [45, 15, 79, 90, 10, 55, 12, 20, 50] and find height.</p>
                            <div class="pdf-doc-title" style="margin-top:12px"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q2. Dijkstra Shortest Path</div>
                            <p>Apply Dijkstra algorithm to find shortest distance from vertex A to all vertices.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: BST Tree Structure</div>
                            <p>Root = 45 | Left Child = 15 | Right Child = 79</p>
                            <p>Tree Height = 4</p>
                            <div class="pdf-doc-code">Inorder Traversal: 10, 12, 15, 20, 45, 50, 55, 79, 90</div>
                        </div>
                    `,
                    comments: []
                }
            ]
        },
        'oop': {
            title: 'Object Oriented Programming (Using C++)',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: [
                {
                    id: 'oop_ass_1',
                    num: 1,
                    title: 'ASSIGNMENT 1: Classes, Objects & Constructors',
                    questionFile: 'OOP_Assignment_1_Questions.pdf',
                    answerFile: 'OOP_Assignment_1_Solutions.pdf',
                    views: 260,
                    downloads: 98,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Student Database Class</div>
                            <p>Create a class Student with roll_no, name, and marks. Demonstrate default, parameterized, and copy constructors.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: C++ Class Implementation</div>
                            <div class="pdf-doc-code">
class Student {<br>
&nbsp;&nbsp;int roll;<br>
&nbsp;&nbsp;string name;<br>
public:<br>
&nbsp;&nbsp;Student(int r, string n) : roll(r), name(n) {}<br>
};
                            </div>
                        </div>
                    `,
                    comments: []
                },
                {
                    id: 'oop_ass_2',
                    num: 2,
                    title: 'ASSIGNMENT 2: Operator Overloading & Inheritance',
                    questionFile: 'OOP_Assignment_2_Questions.pdf',
                    answerFile: 'OOP_Assignment_2_Solutions.pdf',
                    views: 195,
                    downloads: 82,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Complex Number Addition</div>
                            <p>Overload + operator and &lt;&lt; stream insertion operator for Complex class.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: Overloaded Operator</div>
                            <div class="pdf-doc-code">
Complex operator+(const Complex& c) {<br>
&nbsp;&nbsp;return Complex(real + c.real, imag + c.imag);<br>
}
                            </div>
                        </div>
                    `,
                    comments: []
                }
            ]
        },
        'os': {
            title: 'Operating System',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: [
                {
                    id: 'os_ass_1',
                    num: 1,
                    title: 'ASSIGNMENT 1: CPU Scheduling Algorithms',
                    questionFile: 'OS_Assignment_1_Questions.pdf',
                    answerFile: 'OS_Assignment_1_Solutions.pdf',
                    views: 340,
                    downloads: 165,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. FCFS & Round Robin (Quantum=2)</div>
                            <p>Calculate Average Waiting Time and Turnaround Time for processes P1(burst=6), P2(burst=8), P3(burst=2), P4(burst=4).</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: Gantt Chart & Calculation</div>
                            <p>Gantt Chart: [P1: 0-6] -&gt; [P2: 6-14] -&gt; [P3: 14-16] -&gt; [P4: 16-20]</p>
                            <p style="font-weight:600; color:#16a34a;">Avg Waiting Time = 10.5 ms</p>
                        </div>
                    `,
                    comments: []
                }
            ]
        },
        'math': {
            title: 'Engineering Mathematics',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: [
                {
                    id: 'math_ass_1',
                    num: 1,
                    title: 'ASSIGNMENT 1: Linear Algebra & Differential Equations',
                    questionFile: 'Math_Assignment_1_Questions.pdf',
                    answerFile: 'Math_Assignment_1_Solutions.pdf',
                    views: 410,
                    downloads: 210,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Eigenvalues & Eigenvectors</div>
                            <p>Find the characteristic equation and eigenvalues of Matrix A = [[2, 1], [1, 2]].</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: Characteristic Polynomial</div>
                            <p>|A - λI| = 0 ==&gt; λ^2 - 4λ + 3 = 0</p>
                            <p style="font-weight:600; color:#16a34a;">Eigenvalues: λ1 = 3, λ2 = 1</p>
                        </div>
                    `,
                    comments: []
                }
            ]
        },
        'hardware': {
            title: 'Computer Hardware and its Organization',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: [
                {
                    id: 'hardware_ass_1',
                    num: 1,
                    title: 'ASSIGNMENT 1: Logic Gates & Memory Organization',
                    questionFile: 'Hardware_Assignment_1_Questions.pdf',
                    answerFile: 'Hardware_Assignment_1_Solutions.pdf',
                    views: 180,
                    downloads: 75,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. K-Map Minimization</div>
                            <p>Minimize the SOP expression using 4-variable K-Map: F(A,B,C,D) = Σm(0, 2, 8, 10, 14, 15).</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: K-Map Grouping</div>
                            <p>Corner Quad (m0, m2, m8, m10) + Pair (m14, m15)</p>
                            <p style="font-weight:600; color:#16a34a;">Minimized F = B'D' + ABC</p>
                        </div>
                    `,
                    comments: []
                }
            ]
        }
    };

    // Get current subject from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    let subjectKey = urlParams.get('subject') || 'dsa';

    // Default fallback if unknown subject key
    if (!subjectsData[subjectKey]) {
        subjectKey = 'dsa';
    }

    const currentSubject = subjectsData[subjectKey];

    // Update Header Elements
    const subjectTitleEl = document.getElementById('subjectTitle');
    const subjectSubtitleEl = document.getElementById('subjectSubtitle');
    if (subjectTitleEl) subjectTitleEl.textContent = currentSubject.title;
    if (subjectSubtitleEl) subjectSubtitleEl.textContent = currentSubject.subtitle;

    // Persistent Counts & Comments Helper
    function getStoredCounts(assId, defaultViews, defaultDownloads) {
        const stored = localStorage.getItem(`counts_${assId}`);
        if (stored) {
            return JSON.parse(stored);
        }
        return { views: defaultViews, downloads: defaultDownloads };
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

    // Render Assignments List according to Wireframe Drawing
    const assignmentsContainer = document.getElementById('assignmentsList');

    function renderAssignments(filterTerm = '') {
        if (!assignmentsContainer) return;
        assignmentsContainer.innerHTML = '';

        const term = filterTerm.toLowerCase().trim();
        const filteredList = currentSubject.assignments.filter(item =>
            item.title.toLowerCase().includes(term) ||
            item.questionFile.toLowerCase().includes(term) ||
            item.answerFile.toLowerCase().includes(term)
        );

        if (filteredList.length === 0) {
            assignmentsContainer.innerHTML = `
                <div style="text-align:center; padding:3rem; color:#64748b; background:white; border-radius:12px; border:2px dashed #cbd5e1;">
                    <i class="fa-solid fa-file-circle-xmark" style="font-size:3rem; margin-bottom:1rem; color:#94a3b8;"></i>
                    <h3>No assignments found</h3>
                    <p>Try searching for a different keyword or view another subject.</p>
                </div>
            `;
            return;
        }

        filteredList.forEach(ass => {
            const counts = getStoredCounts(ass.id, ass.views, ass.downloads);
            const comments = getStoredComments(ass.id, ass.comments);

            // Increment view counter once per session
            if (!sessionStorage.getItem(`viewed_${ass.id}`)) {
                counts.views += 1;
                saveStoredCounts(ass.id, counts);
                sessionStorage.setItem(`viewed_${ass.id}`, 'true');
            }

            const card = document.createElement('div');
            card.className = 'assignment-card';
            card.setAttribute('data-id', ass.id);

            card.innerHTML = `
                <div class="qa-grid">
                    <!-- LEFT BOX: QUESTION BOX (Matching Wireframe Left) -->
                    <div class="qa-box question-box">
                        <!-- Top Tag Bar: [ass 1 Question | file title (like ASSINMENT 1)] -->
                        <div class="qa-top-bar">
                            <span class="tag-badge">ass ${ass.num} Question</span>
                            <div class="file-title-bar">${ass.title}</div>
                        </div>

                        <!-- PDF file preview box -->
                        <div class="pdf-preview-box">
                            <div class="pdf-header-controls">
                                <span><i class="fa-solid fa-file-pdf"></i> Question PDF Preview</span>
                                <div class="pdf-controls-group">
                                    <button class="pdf-control-btn view-pdf-btn" data-file="${ass.questionFile}"><i class="fa-solid fa-expand"></i> Full View</button>
                                </div>
                            </div>
                            <div class="pdf-body-content">
                                ${ass.questionPreview}
                            </div>
                        </div>

                        <!-- file name box -->
                        <div class="file-name-bar">
                            <i class="fa-solid fa-file-pdf"></i> ${ass.questionFile}
                        </div>

                        <!-- Action Toolbar: [download] [comment] [share] [view and download count] -->
                        <div class="action-toolbar">
                            <button class="action-btn download-btn" data-id="${ass.id}" data-file="${ass.questionFile}" data-type="question">
                                <i class="fa-solid fa-download"></i> Download
                            </button>
                            <button class="action-btn comment-btn" data-id="${ass.id}" data-title="${ass.title}">
                                <i class="fa-solid fa-comment-dots"></i> Comment (${comments.length})
                            </button>
                            <button class="action-btn share-btn" data-id="${ass.id}">
                                <i class="fa-solid fa-share-nodes"></i> Share
                            </button>
                            <div class="count-badge">
                                <span><i class="fa-solid fa-eye" style="color:#0284c7"></i> ${counts.views} views</span>
                                <span>•</span>
                                <span id="dl-count-q-${ass.id}"><i class="fa-solid fa-cloud-arrow-down" style="color:#2563eb"></i> ${counts.downloads} downloads</span>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT BOX: ANSWER BOX (Matching Wireframe Right) -->
                    <div class="qa-box answer-box">
                        <!-- Top Tag Bar: [ass 1 answer | file title (like ASSINMENT 1)] -->
                        <div class="qa-top-bar">
                            <span class="tag-badge">ass ${ass.num} Answer</span>
                            <div class="file-title-bar">${ass.title}</div>
                        </div>

                        <!-- PDF file preview box -->
                        <div class="pdf-preview-box">
                            <div class="pdf-header-controls">
                                <span><i class="fa-solid fa-file-pdf"></i> Solution PDF Preview</span>
                                <div class="pdf-controls-group">
                                    <button class="pdf-control-btn view-pdf-btn" data-file="${ass.answerFile}"><i class="fa-solid fa-expand"></i> Full View</button>
                                </div>
                            </div>
                            <div class="pdf-body-content">
                                ${ass.answerPreview}
                            </div>
                        </div>

                        <!-- file name box -->
                        <div class="file-name-bar">
                            <i class="fa-solid fa-file-pdf"></i> ${ass.answerFile}
                        </div>

                        <!-- Action Toolbar: [download] [comment] [share] [view and download count] -->
                        <div class="action-toolbar">
                            <button class="action-btn download-btn" data-id="${ass.id}" data-file="${ass.answerFile}" data-type="answer">
                                <i class="fa-solid fa-download"></i> Download
                            </button>
                            <button class="action-btn comment-btn" data-id="${ass.id}" data-title="${ass.title}">
                                <i class="fa-solid fa-comment-dots"></i> Comment (${comments.length})
                            </button>
                            <button class="action-btn share-btn" data-id="${ass.id}">
                                <i class="fa-solid fa-share-nodes"></i> Share
                            </button>
                            <div class="count-badge">
                                <span><i class="fa-solid fa-eye" style="color:#16a34a"></i> ${counts.views} views</span>
                                <span>•</span>
                                <span id="dl-count-a-${ass.id}"><i class="fa-solid fa-cloud-arrow-down" style="color:#16a34a"></i> ${counts.downloads} downloads</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            assignmentsContainer.appendChild(card);
        });

        attachActionListeners();
    }

    // Tab Switcher Handling (Both / Questions / Answers)
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

            // Adjust header banner
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

    // Search Input Listener
    const searchInput = document.getElementById('assignmentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderAssignments(e.target.value);
        });
    }

    // Action listeners (Download, Comment, Share, Full View)
    let activeCommentAssId = null;

    function attachActionListeners() {
        // Download Buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const assId = btn.getAttribute('data-id');
                const fileName = btn.getAttribute('data-file');

                // Increment download counter
                const assObj = currentSubject.assignments.find(a => a.id === assId);
                if (assObj) {
                    const counts = getStoredCounts(assId, assObj.views, assObj.downloads);
                    counts.downloads += 1;
                    saveStoredCounts(assId, counts);

                    // Update DOM badges
                    const qBadge = document.getElementById(`dl-count-q-${assId}`);
                    const aBadge = document.getElementById(`dl-count-a-${assId}`);
                    if (qBadge) qBadge.innerHTML = `<i class="fa-solid fa-cloud-arrow-down" style="color:#2563eb"></i> ${counts.downloads} downloads`;
                    if (aBadge) aBadge.innerHTML = `<i class="fa-solid fa-cloud-arrow-down" style="color:#16a34a"></i> ${counts.downloads} downloads`;
                }

                // Simulate file download blob
                triggerBlobDownload(fileName);
                showToast(`Downloading ${fileName}...`);
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
                        showToast('Assignment share link copied to clipboard!');
                    });
                } else {
                    showToast('Share Link: ' + shareUrl);
                }
            });
        });

        // Full View Buttons
        document.querySelectorAll('.view-pdf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fileName = btn.getAttribute('data-file');
                showToast(`Opening ${fileName} in Full Preview...`);
            });
        });
    }

    // Helper: Trigger File Blob Download
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

    // Comment Drawer Logic
    const backdrop = document.getElementById('commentModalBackdrop');
    const closeBtn = document.getElementById('closeCommentDrawer');
    const commentTitle = document.getElementById('commentModalTitle');
    const commentsList = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');

    function openCommentDrawer(assId, title) {
        if (!backdrop) return;
        if (commentTitle) commentTitle.textContent = `Discussion: ${title}`;

        renderDrawerComments(assId);
        backdrop.classList.add('active');
    }

    function closeCommentDrawer() {
        if (!backdrop) return;
        backdrop.classList.remove('active');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeCommentDrawer);
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeCommentDrawer();
        });
    }

    function renderDrawerComments(assId) {
        if (!commentsList) return;
        commentsList.innerHTML = '';

        const assObj = currentSubject.assignments.find(a => a.id === assId);
        const defaultComments = assObj ? assObj.comments : [];
        const comments = getStoredComments(assId, defaultComments);

        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div style="text-align:center; padding:2rem; color:#94a3b8;">
                    <i class="fa-regular fa-comments" style="font-size:2.5rem; margin-bottom:0.5rem;"></i>
                    <p>No comments yet. Be the first to ask a question or leave a note!</p>
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
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeCommentAssId) return;

            const nameInput = document.getElementById('authorNameInput');
            const textInput = document.getElementById('commentTextInput');

            const name = nameInput.value.trim() || 'Anonymous Student';
            const text = textInput.value.trim();

            if (!text) return;

            const assObj = currentSubject.assignments.find(a => a.id === activeCommentAssId);
            const defaultComments = assObj ? assObj.comments : [];
            const comments = getStoredComments(activeCommentAssId, defaultComments);

            comments.push({
                name: name,
                text: text,
                date: 'Just now'
            });

            saveStoredComments(activeCommentAssId, comments);
            renderDrawerComments(activeCommentAssId);
            renderAssignments(searchInput ? searchInput.value : '');

            textInput.value = '';
            showToast('Comment posted successfully!');
        });
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

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // Initial render
    renderAssignments();
});
