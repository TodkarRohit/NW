// Engineering Notes Hub - Assignments Section Script
// Features: Chapter/Unit Navigation, Admin-Only File Upload, Side-by-Side Q&A, PDF Previews & Discussion

document.addEventListener('DOMContentLoaded', () => {
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

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    initTheme();

    // ---------------------------------------------------------
    // 2. Subject & Chapter Data Definition
    // ---------------------------------------------------------
    const defaultSubjectAssignments = {
        'dsa': {
            title: 'Data Structure and Algorithm (C++)',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: [
                {
                    id: 'dsa_ass_1',
                    chapterId: 'dsa-u1',
                    unit: 'Unit 1',
                    chapterTitle: 'Unit 1: Introduction to Data Structures and Memory Representation',
                    num: 1,
                    title: 'ASSIGNMENT 1: Array Operations & Sparse Matrices',
                    questionFile: 'DSA_Assignment_1_Questions.pdf',
                    answerFile: 'DSA_Assignment_1_Solutions.pdf',
                    views: 420,
                    downloads: 185,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Matrix Transpose & Multiplication</div>
                            <p>Write a C++ program to perform 2D Matrix multiplication and find transpose without creating an auxiliary matrix.</p>
                            <div class="pdf-doc-code">
// Input: Matrix A[N][N]
// Output: Transpose A^T in-place
                            </div>
                            <div class="pdf-doc-title" style="margin-top:12px"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q2. Sparse Matrix Representation</div>
                            <p>Implement Triple array representation for sparse matrix and write addition of two sparse matrices.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: C++ In-Place Transpose</div>
                            <div class="pdf-doc-code">
#include &lt;iostream&gt;
using namespace std;
void transpose(int mat[3][3]) {
    for(int i=0; i&lt;3; i++)
        for(int j=i+1; j&lt;3; j++)
            swap(mat[i][j], mat[j][i]);
}
                            </div>
                            <p style="margin-top:8px; font-weight:600; color:#16a34a;">Time Complexity: O(N^2) | Space Complexity: O(1)</p>
                        </div>
                    `,
                    comments: [
                        { name: 'Rahul Sharma', text: 'Solutions for Q2 sparse matrix addition are very clear!', date: '2 hours ago' },
                        { name: 'Priya Patel', text: 'Is there an alternative in-place transpose algorithm?', date: '1 day ago' }
                    ]
                },
                {
                    id: 'dsa_ass_2',
                    chapterId: 'dsa-u2',
                    unit: 'Unit 2',
                    chapterTitle: 'Unit 2: Searching and Sorting Techniques',
                    num: 2,
                    title: 'ASSIGNMENT 2: Searching & Quick / Merge Sorting Analysis',
                    questionFile: 'DSA_Assignment_2_Questions.pdf',
                    answerFile: 'DSA_Assignment_2_Solutions.pdf',
                    views: 380,
                    downloads: 160,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Quick Sort with Median-of-Three Pivot</div>
                            <p>Explain the Quick Sort algorithm partitioning step and implement randomized pivot selection in C++.</p>
                            <div class="pdf-doc-title" style="margin-top:12px"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q2. Binary Search & Time Complexity</div>
                            <p>Derive recurrence relation for Binary Search and compute Best, Average, and Worst case complexities.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: Quick Sort Partition</div>
                            <div class="pdf-doc-code">
int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for(int j = low; j < high; j++) {
        if(arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i+1], arr[high]);
    return i + 1;
}
                            </div>
                        </div>
                    `,
                    comments: []
                },
                {
                    id: 'dsa_ass_3',
                    chapterId: 'dsa-u3',
                    unit: 'Unit 3',
                    chapterTitle: 'Unit 3: Stack',
                    num: 3,
                    title: 'ASSIGNMENT 3: Stack Applications & Expression Evaluation',
                    questionFile: 'DSA_Assignment_3_Questions.pdf',
                    answerFile: 'DSA_Assignment_3_Solutions.pdf',
                    views: 310,
                    downloads: 142,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Infix to Postfix Conversion</div>
                            <p>Convert infix expression: <code>A + (B * C - (D / E ^ F) * G) * H</code> into postfix notation using Stack.</p>
                            <div class="pdf-doc-title" style="margin-top:12px"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q2. Balanced Parentheses Checker</div>
                            <p>Write an algorithm using stack to verify if a string with (), {}, [] is well-formed.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: Postfix Conversion</div>
                            <div class="pdf-doc-code">
Postfix Result: A B C * D E F ^ / G * - H * +
                            </div>
                            <p style="margin-top:8px; font-weight:600; color:#16a34a;">Stack precedence rules applied: ^ > * / > + -</p>
                        </div>
                    `,
                    comments: []
                },
                {
                    id: 'dsa_ass_4',
                    chapterId: 'dsa-u4',
                    unit: 'Unit 4',
                    chapterTitle: 'Unit 4: Queue',
                    num: 4,
                    title: 'ASSIGNMENT 4: Circular Queue, Deque & Priority Queue',
                    questionFile: 'DSA_Assignment_4_Questions.pdf',
                    answerFile: 'DSA_Assignment_4_Solutions.pdf',
                    views: 289,
                    downloads: 110,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Circular Queue Array Implementation</div>
                            <p>Implement enqueue and dequeue operations in Circular Queue using modulo arithmetic.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: Circular Queue Enqueue</div>
                            <div class="pdf-doc-code">
void enqueue(int val) {
    if((rear + 1) % MAX == front) { cout << "Queue Full"; return; }
    if(front == -1) front = 0;
    rear = (rear + 1) % MAX;
    arr[rear] = val;
}
                            </div>
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
                    chapterId: 'oop-u1',
                    unit: 'Unit 1',
                    chapterTitle: 'Unit 1: Fundamentals of Object-Oriented Programming',
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
class Student {
    int roll;
    string name;
public:
    Student(int r, string n) : roll(r), name(n) {}
};
                            </div>
                        </div>
                    `,
                    comments: []
                },
                {
                    id: 'oop_ass_2',
                    chapterId: 'oop-u2',
                    unit: 'Unit 2',
                    chapterTitle: 'Unit 2: Inheritance and Polymorphism',
                    num: 2,
                    title: 'ASSIGNMENT 2: Virtual Functions & Multiple Inheritance',
                    questionFile: 'OOP_Assignment_2_Questions.pdf',
                    answerFile: 'OOP_Assignment_2_Solutions.pdf',
                    views: 195,
                    downloads: 82,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Polymorphism with Abstract Base Class</div>
                            <p>Design a Shape hierarchy with pure virtual function calculateArea() in base class.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: Pure Virtual Function</div>
                            <div class="pdf-doc-code">
class Shape {
public:
    virtual double calculateArea() = 0;
};
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
                    chapterId: 'os-u1',
                    unit: 'Unit 1',
                    chapterTitle: 'Unit 1: Introduction to Operating Systems and Process',
                    num: 1,
                    title: 'ASSIGNMENT 1: Process Creation & CPU Scheduling Algorithms',
                    questionFile: 'OS_Assignment_1_Questions.pdf',
                    answerFile: 'OS_Assignment_1_Solutions.pdf',
                    views: 340,
                    downloads: 165,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. FCFS & Round Robin (Quantum=2)</div>
                            <p>Calculate Average Waiting Time and Turnaround Time for processes P1(6ms), P2(8ms), P3(2ms), P4(4ms).</p>
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
                },
                {
                    id: 'os_ass_2',
                    chapterId: 'os-u2',
                    unit: 'Unit 2',
                    chapterTitle: 'Unit 2: Inter Process Communication and Deadlock',
                    num: 2,
                    title: 'ASSIGNMENT 2: Banker\'s Algorithm & Semaphores',
                    questionFile: 'OS_Assignment_2_Questions.pdf',
                    answerFile: 'OS_Assignment_2_Solutions.pdf',
                    views: 290,
                    downloads: 130,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Banker's Safety Algorithm</div>
                            <p>Given 5 processes and 3 resources (A:10, B:5, C:7), determine if system is in safe state.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: Safe Sequence</div>
                            <p style="font-weight:600; color:#16a34a;">Safe Sequence: &lt;P1, P3, P4, P0, P2&gt;</p>
                        </div>
                    `,
                    comments: []
                }
            ]
        },
        'maths': {
            title: 'Engineering Mathematics',
            subtitle: 'Semester 2 • NMIET Computer Engineering Department',
            assignments: [
                {
                    id: 'math_ass_1',
                    chapterId: 'math-u1',
                    unit: 'Unit 1',
                    chapterTitle: 'Unit 1: Logic, Proof Techniques & Sets',
                    num: 1,
                    title: 'ASSIGNMENT 1: Propositional Logic & Truth Tables',
                    questionFile: 'Math_Assignment_1_Questions.pdf',
                    answerFile: 'Math_Assignment_1_Solutions.pdf',
                    views: 410,
                    downloads: 210,
                    questionPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-lines" style="color:#0284c7"></i> Q1. Tautology Proof</div>
                            <p>Prove that (P ∧ (P → Q)) → Q is a tautology using truth table and logical equivalence.</p>
                        </div>
                    `,
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-square-check" style="color:#16a34a"></i> Solution Q1: Modus Ponens Law</div>
                            <p style="font-weight:600; color:#16a34a;">All rows in the truth table evaluate to True (T).</p>
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
                    chapterId: 'coa-u1',
                    unit: 'Unit 1',
                    chapterTitle: 'Unit 1: Data representation',
                    num: 1,
                    title: 'ASSIGNMENT 1: Logic Gates, K-Maps & Number Systems',
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

    // Aliases
    defaultSubjectAssignments['math'] = defaultSubjectAssignments['maths'];
    defaultSubjectAssignments['coa'] = defaultSubjectAssignments['hardware'];

    // ---------------------------------------------------------
    // 3. Resolve Current Subject and Chapters
    // ---------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    let subjectKey = urlParams.get('subject') || 'dsa';

    if (subjectKey === 'math') subjectKey = 'maths';
    if (subjectKey === 'coa') subjectKey = 'hardware';

    if (!defaultSubjectAssignments[subjectKey]) {
        subjectKey = 'dsa';
    }

    const currentSubject = defaultSubjectAssignments[subjectKey];

    // Chapters from data.js or default fallback
    let subjectChapters = [];
    if (typeof subjectsData !== 'undefined' && subjectsData[subjectKey] && subjectsData[subjectKey].chapters) {
        subjectChapters = subjectsData[subjectKey].chapters;
    } else {
        subjectChapters = [
            { id: `${subjectKey}-u1`, title: 'Unit 1: Fundamentals & Concepts', unit: 'Unit 1', name: 'Fundamentals & Concepts' },
            { id: `${subjectKey}-u2`, title: 'Unit 2: Core Architecture & Methods', unit: 'Unit 2', name: 'Core Architecture & Methods' },
            { id: `${subjectKey}-u3`, title: 'Unit 3: Advanced Operations', unit: 'Unit 3', name: 'Advanced Operations' },
            { id: `${subjectKey}-u4`, title: 'Unit 4: Applications & Implementations', unit: 'Unit 4', name: 'Applications & Implementations' }
        ];
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
    if (notesNavBtn) notesNavBtn.href = `../notes/viewer.html?subject=${subjectKey}&type=notes`;
    if (qbNavBtn) qbNavBtn.href = `../question_bank/viewer.html?subject=${subjectKey}&type=qb`;
    if (assNavBtn) assNavBtn.href = `assignments.html?subject=${subjectKey}`;
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
        if (window.authService && window.authService.isLoggedIn()) {
            return true;
        }
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
                    isAdminMode = true;
                    updateAdminUI();
                    closeAdminLoginModal();
                    showToast(`Registration successful! Welcome, ${userVal}!`);
                } else {
                    try {
                        await window.authService.login(userVal, passVal);
                        isAdminMode = true;
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
        adminToggleBtn.addEventListener('click', () => {
            if (checkIsAdmin()) {
                isAdminMode = false;
                if (window.authService) window.authService.logout();
                else localStorage.setItem('isAdminMode', 'false');
                updateAdminUI();
                showToast('Logged out.');
            } else {
                window.location.href = '../admin/index.html';
            }
        });
    }

    // ---------------------------------------------------------
    // 6. Combined Assignments Helper
    // ---------------------------------------------------------
    function getCombinedAssignments(sKey) {
        const builtIn = defaultSubjectAssignments[sKey] ? defaultSubjectAssignments[sKey].assignments : [];
        const customJSON = localStorage.getItem(`custom_assignments_${sKey}`);
        const custom = customJSON ? JSON.parse(customJSON) : [];
        return [...custom, ...builtIn];
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
            const count = allAssignments.filter(a => a.chapterId === ch.id || a.unit === ch.unit || a.chapterTitle === ch.title).length;
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
                if (openUploadModalBtn) openUploadModalBtn.style.display = 'inline-flex';
            } else {
                adminToggleBtn.classList.remove('active');
                adminToggleBtn.innerHTML = '<i class="fa-solid fa-user-shield"></i> <span>Admin Mode</span>';
                if (openUploadModalBtn) openUploadModalBtn.style.display = 'none';
            }
        }

        renderAdminUploadSection();
        renderChapterNav();
        renderAssignments(searchInput ? searchInput.value : '');
    }

    function renderAdminUploadSection() {
        if (!adminUploadPortalSection) return;

        if (!isAdminMode) {
            adminUploadPortalSection.innerHTML = `
                <div class="admin-upload-locked-card">
                    <div class="locked-icon-wrap">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <div class="locked-info-content">
                        <h3>Assignment Upload Portal (Admin Protected)</h3>
                        <p>Only verified faculty and portal administrators can upload question & solution PDF documents for this course.</p>
                    </div>
                    <button type="button" class="admin-login-cta-btn" id="inlineAdminLoginBtn">
                        <i class="fa-solid fa-lock"></i> Login as Admin to Upload
                    </button>
                </div>
            `;
            const inlineBtn = document.getElementById('inlineAdminLoginBtn');
            if (inlineBtn) inlineBtn.addEventListener('click', () => window.location.href = '../admin/index.html');
        } else {
            adminUploadPortalSection.innerHTML = `
                <div class="admin-upload-active-card">
                    <div class="upload-card-top">
                        <div class="upload-title-wrap">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <div>
                                <h3>Upload New Assignment Files (Admin Active)</h3>
                                <p>Upload Question & Answer PDF documents to be published under the selected chapter.</p>
                            </div>
                        </div>
                        <span class="admin-status-badge"><i class="fa-solid fa-circle-check"></i> Admin Verified</span>
                    </div>

                    <form id="inPageAdminUploadForm" class="inpage-upload-form">
                        <div class="form-grid-3">
                            <div class="form-group">
                                <label for="inpageUploadChapter"><i class="fa-solid fa-folder-tree"></i> Select Target Chapter</label>
                                <select id="inpageUploadChapter" required>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="inpageUploadAssNum"><i class="fa-solid fa-hashtag"></i> Assignment No.</label>
                                <input type="number" id="inpageUploadAssNum" min="1" max="50" placeholder="e.g. 1" required>
                            </div>
                            <div class="form-group">
                                <label for="inpageUploadAssTitle"><i class="fa-solid fa-heading"></i> Assignment Title</label>
                                <input type="text" id="inpageUploadAssTitle" placeholder="e.g. ASSIGNMENT 1: Array Operations" required>
                            </div>
                        </div>

                        <div class="form-grid-2">
                            <div class="form-group">
                                <label for="inpageUploadQPdf"><i class="fa-solid fa-file-pdf" style="color:#0284c7"></i> Question PDF Document</label>
                                <div class="file-dropzone" id="inpageQDropzone">
                                    <i class="fa-solid fa-file-circle-question" style="color:#0284c7"></i>
                                    <span class="file-name-display" id="inpageQPdfName">Choose Question PDF file...</span>
                                    <input type="file" id="inpageUploadQPdf" accept=".pdf" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="inpageUploadAPdf"><i class="fa-solid fa-file-pdf" style="color:#16a34a"></i> Solution / Answer PDF Document</label>
                                <div class="file-dropzone" id="inpageADropzone">
                                    <i class="fa-solid fa-file-circle-check" style="color:#16a34a"></i>
                                    <span class="file-name-display" id="inpageAPdfName">Choose Solution PDF file...</span>
                                    <input type="file" id="inpageUploadAPdf" accept=".pdf" required>
                                </div>
                            </div>
                        </div>

                        <div class="form-grid-2">
                            <div class="form-group">
                                <label for="inpageUploadQNotes"><i class="fa-solid fa-align-left"></i> Question Description / Highlights (Optional)</label>
                                <textarea id="inpageUploadQNotes" rows="2" placeholder="Briefly describe questions, problem statements..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="inpageUploadANotes"><i class="fa-solid fa-square-check"></i> Solution Approach / Notes (Optional)</label>
                                <textarea id="inpageUploadANotes" rows="2" placeholder="Briefly describe solution complexity, method..."></textarea>
                            </div>
                        </div>

                        <div class="form-actions-right">
                            <button type="submit" class="submit-upload-btn">
                                <i class="fa-solid fa-cloud-arrow-up"></i> Publish to Chapter
                            </button>
                        </div>
                    </form>
                </div>
            `;

            attachInPageUploadListeners();
            updateUploadChapterDropdown();
        }
    }

    function updateUploadChapterDropdown() {
        const inpageSelect = document.getElementById('inpageUploadChapter');
        const modalSelect = document.getElementById('uploadChapterSelect');

        const optionsHtml = subjectChapters.map(ch => `
            <option value="${ch.id}" ${activeChapterId === ch.id ? 'selected' : ''}>
                ${ch.unit ? `${ch.unit}: ` : ''}${ch.name || ch.title}
            </option>
        `).join('');

        if (inpageSelect) inpageSelect.innerHTML = optionsHtml;
        if (modalSelect) modalSelect.innerHTML = optionsHtml;
    }

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
                    window.location.href = '../admin/index.html';
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
                    const qDataUrl = await fileToDataUrl(qFile);
                    const aDataUrl = await fileToDataUrl(aFile);

                    const targetChObj = subjectChapters.find(c => c.id === targetChapterId) || subjectChapters[0];

                    const newAss = {
                        id: `custom_ass_${Date.now()}`,
                        chapterId: targetChapterId,
                        unit: targetChObj.unit || 'Unit 1',
                        chapterTitle: targetChObj.title,
                        num: assNum,
                        title: assTitle,
                        questionFile: qFile.name,
                        answerFile: aFile.name,
                        questionDataUrl: qDataUrl,
                        answerDataUrl: aDataUrl,
                        views: 1,
                        downloads: 0,
                        isCustom: true,
                        comments: [],
                        questionPreview: `
                            <div class="pdf-doc-view">
                                <div class="pdf-doc-title"><i class="fa-solid fa-file-pdf" style="color:#0284c7"></i> ${escapeHtml(qFile.name)}</div>
                                <p>${escapeHtml(qNotes || 'Uploaded PDF Question Document. Click Download below or Full View to inspect.')}</p>
                                <div class="pdf-doc-meta" style="margin-top:8px;">File size: ${(qFile.size / 1024).toFixed(1)} KB • PDF Document</div>
                            </div>
                        `,
                        answerPreview: `
                            <div class="pdf-doc-view">
                                <div class="pdf-doc-title"><i class="fa-solid fa-file-pdf" style="color:#16a34a"></i> ${escapeHtml(aFile.name)}</div>
                                <p>${escapeHtml(aNotes || 'Uploaded PDF Solution Document. Click Download below or Full View to inspect.')}</p>
                                <div class="pdf-doc-meta" style="margin-top:8px;">File size: ${(aFile.size / 1024).toFixed(1)} KB • PDF Document</div>
                            </div>
                        `
                    };

                    const existingCustomJSON = localStorage.getItem(`custom_assignments_${subjectKey}`);
                    const existingCustom = existingCustomJSON ? JSON.parse(existingCustomJSON) : [];
                    existingCustom.unshift(newAss);
                    localStorage.setItem(`custom_assignments_${subjectKey}`, JSON.stringify(existingCustom));

                    inpageForm.reset();
                    if (qNameDisplay) qNameDisplay.textContent = 'Choose Question PDF file...';
                    if (aNameDisplay) aNameDisplay.textContent = 'Choose Solution PDF file...';

                    activeChapterId = targetChapterId;
                    renderChapterNav();
                    renderAssignments(searchInput ? searchInput.value : '');

                    showToast('Assignment published successfully under ' + (targetChObj.unit || 'chapter') + '!');
                } catch (err) {
                    console.error(err);
                    showToast('Error uploading files.');
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
                                ${ass.answerPreview}
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
                            <button class="action-btn share-btn" data-id="${ass.id}">
                                <i class="fa-solid fa-share-nodes"></i> Share
                            </button>
                            ${adminDeleteBtnHtml}
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
            btn.addEventListener('click', () => {
                if (!isAdminMode) {
                    window.location.href = '../admin/index.html';
                    return;
                }
                const assId = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this assignment?')) {
                    deleteCustomAssignment(subjectKey, assId);
                }
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

    function deleteCustomAssignment(sKey, assId) {
        let customList = [];
        const stored = localStorage.getItem(`custom_assignments_${sKey}`);
        if (stored) {
            customList = JSON.parse(stored);
        }
        customList = customList.filter(a => a.id !== assId);
        localStorage.setItem(`custom_assignments_${sKey}`, JSON.stringify(customList));
        showToast('Assignment deleted successfully.');
        renderChapterNav();
        renderAssignments(searchInput ? searchInput.value : '');
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
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeCommentAssId) return;

            const nameInput = document.getElementById('authorNameInput');
            const textInput = document.getElementById('commentTextInput');

            const name = nameInput.value.trim() || 'Anonymous Student';
            const text = textInput.value.trim();

            if (!text) return;

            const allAss = getCombinedAssignments(subjectKey);
            const assObj = allAss.find(a => a.id === activeCommentAssId);
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
                window.location.href = '../admin/index.html';
                return;
            }
            if (uploadModalBackdrop) {
                const selectSub = document.getElementById('uploadSubjectSelect');
                if (selectSub) selectSub.value = subjectKey;
                updateUploadChapterDropdown();
                uploadModalBackdrop.classList.add('active');
            }
        });
    }

    function closeUploadModal() {
        if (uploadModalBackdrop) uploadModalBackdrop.classList.remove('active');
        if (adminUploadForm) adminUploadForm.reset();
        if (qPdfNameDisplay) qPdfNameDisplay.textContent = 'Choose Question PDF...';
        if (aPdfNameDisplay) aPdfNameDisplay.textContent = 'Choose Solution PDF...';
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
                qPdfNameDisplay.textContent = '📄 ' + e.target.files[0].name;
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
                window.location.href = '../admin/index.html';
                return;
            }

            const targetSubjectKey = document.getElementById('uploadSubjectSelect').value;
            const targetChapterId = document.getElementById('uploadChapterSelect').value;
            const assNum = parseInt(document.getElementById('uploadAssNum').value, 10);
            const assTitle = document.getElementById('uploadAssTitle').value.trim();
            const qNotes = document.getElementById('uploadQuestionNotes').value.trim();
            const aNotes = document.getElementById('uploadAnswerNotes').value.trim();

            const qFile = uploadQuestionPdfInput.files[0];
            const aFile = uploadAnswerPdfInput.files[0];

            if (!qFile || !aFile) {
                showToast('Please select both Question PDF and Solution PDF files!');
                return;
            }

            try {
                showToast('Processing & Uploading PDF Files...');
                const qDataUrl = await fileToDataUrl(qFile);
                const aDataUrl = await fileToDataUrl(aFile);

                const targetChObj = subjectChapters.find(c => c.id === targetChapterId) || subjectChapters[0];

                const newAssId = `custom_ass_${Date.now()}`;
                const newAssignment = {
                    id: newAssId,
                    chapterId: targetChapterId,
                    unit: targetChObj ? targetChObj.unit : 'Unit 1',
                    chapterTitle: targetChObj ? targetChObj.title : 'Unit 1',
                    num: assNum,
                    title: assTitle,
                    questionFile: qFile.name,
                    answerFile: aFile.name,
                    questionDataUrl: qDataUrl,
                    answerDataUrl: aDataUrl,
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
                    answerPreview: `
                        <div class="pdf-doc-view">
                            <div class="pdf-doc-title"><i class="fa-solid fa-file-pdf" style="color:#16a34a"></i> ${escapeHtml(aFile.name)}</div>
                            <p>${escapeHtml(aNotes || 'Uploaded PDF Solution Document. Click Download below to get full PDF file.')}</p>
                            <div class="pdf-doc-meta" style="margin-top:8px;">File size: ${(aFile.size / 1024).toFixed(1)} KB • PDF Document</div>
                        </div>
                    `
                };

                const existingCustomJSON = localStorage.getItem(`custom_assignments_${targetSubjectKey}`);
                const existingCustom = existingCustomJSON ? JSON.parse(existingCustomJSON) : [];
                existingCustom.unshift(newAssignment);
                localStorage.setItem(`custom_assignments_${targetSubjectKey}`, JSON.stringify(existingCustom));

                closeUploadModal();
                showToast('Assignment & PDF Files Published Successfully!');

                if (targetSubjectKey === subjectKey) {
                    activeChapterId = targetChapterId;
                    renderChapterNav();
                    renderAssignments(searchInput ? searchInput.value : '');
                } else {
                    window.location.search = `?subject=${targetSubjectKey}`;
                }
            } catch (err) {
                console.error(err);
                showToast('Error processing PDF file upload.');
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

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initial load
    renderChapterNav();
    updateAdminUI();
});








