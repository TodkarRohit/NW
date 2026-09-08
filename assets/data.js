// Engineering Notes Hub - Domain OOP Model Classes
class Branch {
    constructor(code, name) {
        this.code = code || '';
        this.name = name || code || '';
    }

    toJSON() {
        return { code: this.code, name: this.name };
    }

    static fromData(data) {
        if (!data) return null;
        if (typeof data === 'string') return new Branch(data, data);
        return new Branch(data.code, data.name);
    }
}

class Unit {
    constructor(data = {}) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.unit = data.unit || 'Unit 1';
        this.name = data.name || data.title || '';
        this.document = data.document || null;
    }

    attachDocument(doc) {
        this.document = doc;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            unit: this.unit,
            name: this.name,
            ...(this.document ? { document: this.document } : {})
        };
    }

    static fromData(data) {
        return new Unit(data);
    }
}

class StudyNote {
    constructor(data = {}) {
        this.name = data.name || '';
        this.size = data.size || 0;
        this.type = data.type || 'application/pdf';
        this.date = data.date || new Date().toLocaleDateString();
        this.data = data.data || '';
        this.category = data.category || 'Study Notes';
    }

    toJSON() {
        return {
            name: this.name,
            size: this.size,
            type: this.type,
            date: this.date,
            data: this.data,
            category: this.category
        };
    }
}

class QuestionBankItem {
    constructor(data = {}) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.unit = data.unit || 'Unit 1';
        this.name = data.name || data.title || '';
        this.document = data.document || null;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            unit: this.unit,
            name: this.name,
            ...(this.document ? { document: this.document } : {})
        };
    }
}

class Subject {
    constructor(data = {}) {
        this.id = data.id || data.code || '';
        this.title = data.title || '';
        this.semester = data.semester || 'Semester 2';
        this.typeName = data.typeName || 'Study Notes';
        this.branches = Array.isArray(data.branches) ? data.branches : ['ALL'];
        this.resources = data.resources || { notes: true, qb: true, assignments: true };
        this.customLinks = Array.isArray(data.customLinks) ? data.customLinks : [];
        
        this.chapters = (data.chapters || []).map(ch => ch instanceof Unit ? ch : new Unit(ch));
        this.questionBanks = (data.questionBanks || []).map(qb => qb instanceof QuestionBankItem ? qb : new QuestionBankItem(qb));
        this.assignments = Array.isArray(data.assignments) ? data.assignments : [];
    }

    addChapter(chapterData) {
        const unit = chapterData instanceof Unit ? chapterData : new Unit(chapterData);
        this.chapters.push(unit);
        return unit;
    }

    removeChapter(unitId) {
        this.chapters = this.chapters.filter(ch => ch.id !== unitId && ch.title !== unitId);
    }

    addQuestionBank(qbData) {
        const qb = qbData instanceof QuestionBankItem ? qbData : new QuestionBankItem(qbData);
        this.questionBanks.push(qb);
        return qb;
    }

    removeQuestionBank(qbId) {
        this.questionBanks = this.questionBanks.filter(qb => qb.id !== qbId && qb.title !== qbId);
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            semester: this.semester,
            typeName: this.typeName,
            branches: this.branches,
            resources: this.resources,
            customLinks: this.customLinks,
            chapters: this.chapters.map(c => typeof c.toJSON === 'function' ? c.toJSON() : c),
            questionBanks: this.questionBanks.map(q => typeof q.toJSON === 'function' ? q.toJSON() : q),
            assignments: this.assignments
        };
    }

    static fromData(data) {
        if (!data) return null;
        if (data instanceof Subject) return data;
        return new Subject(data);
    }
}

window.Branch = Branch;
window.Unit = Unit;
window.StudyNote = StudyNote;
window.QuestionBankItem = QuestionBankItem;
window.Subject = Subject;

// Engineering Notes Hub - Study Notes & Question Banks Data
const subjectsData = {
    "dsa": Subject.fromData({
        id: "dsa",
        title: "Data Structure and Algorithm(C++)",
        semester: "Semester 2",
        typeName: "Study Notes",
        chapters: [
            { id: "dsa-u1", title: "Unit 1: Introduction to Data Structures and Memory Representation", unit: "Unit 1", name: "Introduction to Data Structures and Memory Representation" },
            { id: "dsa-u2", title: "Unit 2: Searching and Sorting Techniques", unit: "Unit 2", name: "Searching and Sorting Techniques" },
            { id: "dsa-u3", title: "Unit 3: Stack", unit: "Unit 3", name: "Stack" },
            { id: "dsa-u4", title: "Unit 4: Queue", unit: "Unit 4", name: "Queue" }
        ],
        questionBanks: [
            { id: "dsa-qb1", title: "Unit 1 Question Bank: Data Structures Basics & Arrays", unit: "Unit 1", name: "Arrays, Pointers & Memory Allocation Question Bank" },
            { id: "dsa-qb2", title: "Unit 2 Question Bank: Searching & Sorting Algorithms", unit: "Unit 2", name: "Linear/Binary Search, Quick/Merge/Bubble Sort Questions" },
            { id: "dsa-qb3", title: "Unit 3 Question Bank: Stacks & Applications", unit: "Unit 3", name: "Infix to Postfix, Recursion & Expression Trees" },
            { id: "dsa-qb4", title: "Unit 4 Question Bank: Queues, Deque & Circular Queue", unit: "Unit 4", name: "Priority Queue, BFS & Circular Queue Questions" }
        ]
    }),
    "oop": Subject.fromData({
        id: "oop",
        title: "Object Oriented Programming (Using C++)",
        semester: "Semester 2",
        typeName: "Study Notes",
        chapters: [
            { id: "oop-u1", title: "Unit 1: Fundamentals of Object-Oriented Programming", unit: "Unit 1", name: "Fundamentals of Object-Oriented Programming" },
            { id: "oop-u2", title: "Unit 2: Inheritance and Polymorphism", unit: "Unit 2", name: "Inheritance and Polymorphism" },
            { id: "oop-u3", title: "Unit 3: Exception Handling and Pointers", unit: "Unit 3", name: "Exception Handling and Pointers" },
            { id: "oop-u4", title: "Unit 4: File Handling", unit: "Unit 4", name: "File Handling" }
        ],
        questionBanks: [
            { id: "oop-qb1", title: "Unit 1 Question Bank: Classes, Objects & Constructors", unit: "Unit 1", name: "Constructors, Destructors & Encapsulation" },
            { id: "oop-qb2", title: "Unit 2 Question Bank: Inheritance & Virtual Functions", unit: "Unit 2", name: "Polymorphism, Abstract Classes & Overriding" },
            { id: "oop-qb3", title: "Unit 3 Question Bank: Exception Handling & Templates", unit: "Unit 3", name: "Try-Catch Blocks, Custom Exceptions & Generic Functions" },
            { id: "oop-qb4", title: "Unit 4 Question Bank: Streams & File I/O", unit: "Unit 4", name: "File Pointers, Binary/Text Files & Serialization" }
        ]
    }),
    "hardware": Subject.fromData({
        id: "hardware",
        title: "Computer Organization and Architecture",
        semester: "Semester 2",
        typeName: "Study Notes",
        chapters: [
            { id: "coa-u1", title: "Unit 1: Data representation", unit: "Unit 1", name: "Data representation" },
            { id: "coa-u2", title: "Unit 2: Basic Computer Organization and Design", unit: "Unit 2", name: "Basic Computer Organization and Design" },
            { id: "coa-u3", title: "Unit 3: Pipelining", unit: "Unit 3", name: "Pipelining" },
            { id: "coa-u4", title: "Unit 4: Input-output Organization", unit: "Unit 4", name: "Input-output Organization" }
        ],
        questionBanks: [
            { id: "coa-qb1", title: "Unit 1 Question Bank: Data Representation & Number Systems", unit: "Unit 1", name: "Binary Arithmetic, Floating Point & 2's Complement" },
            { id: "coa-qb2", title: "Unit 2 Question Bank: Register Transfer & Microoperations", unit: "Unit 2", name: "ALU Design, Control Memory & Instruction Cycles" },
            { id: "coa-qb3", title: "Unit 3 Question Bank: Pipelining & Vector Processing", unit: "Unit 3", name: "Instruction Pipelining, Hazards & Branch Prediction" },
            { id: "coa-qb4", title: "Unit 4 Question Bank: Memory Hierarchy & I/O Organization", unit: "Unit 4", name: "Cache Mapping, DMA Controller & Interrupts" }
        ]
    }),
    "maths": Subject.fromData({
        id: "maths",
        title: "Engineering Mathematics",
        semester: "Semester 2",
        typeName: "Study Notes",
        chapters: [
            { id: "math-u1", title: "Unit 1: Logic, Proof Techniques & Sets", unit: "Unit 1", name: "Logic, Proof Techniques & Sets" },
            { id: "math-u2", title: "Unit 2: Relations, Recurrence & Combinatory", unit: "Unit 2", name: "Relations, Recurrence & Combinatory" },
            { id: "math-u3", title: "Unit 3: Fourier and Z-Transforms", unit: "Unit 3", name: "Fourier and Z-Transforms" },
            { id: "math-u4", title: "Unit 4: Statistics & Probability", unit: "Unit 4", name: "Statistics & Probability" },
            { id: "math-u5", title: "Unit 5: Numerical Methods", unit: "Unit 5", name: "Numerical Methods" }
        ],
        questionBanks: [
            { id: "math-qb1", title: "Unit 1 Question Bank: Propositional Logic & Set Theory", unit: "Unit 1", name: "Truth Tables, Proofs by Induction & Set Operations" },
            { id: "math-qb2", title: "Unit 2 Question Bank: Recurrence Relations & Combinatorics", unit: "Unit 2", name: "Generating Functions, Permutations & Combinations" },
            { id: "math-qb3", title: "Unit 3 Question Bank: Fourier Series & Transforms", unit: "Unit 3", name: "Fourier Integrals, Half-range Series & Z-Transforms" },
            { id: "math-qb4", title: "Unit 4 Question Bank: Probability Distributions & Statistics", unit: "Unit 4", name: "Normal, Binomial, Poisson & Hypothesis Testing" },
            { id: "math-qb5", title: "Unit 5 Question Bank: Numerical Differentiation & Integration", unit: "Unit 5", name: "Newton-Raphson, Simpson's Rules & Runge-Kutta" }
        ]
    }),
    "os": Subject.fromData({
        id: "os",
        title: "Operating System",
        semester: "Semester 2",
        typeName: "Study Notes",
        chapters: [
            { id: "os-u1", title: "Unit 1: Introduction to Operating Systems and Process", unit: "Unit 1", name: "Introduction to Operating Systems and Process" },
            { id: "os-u2", title: "Unit 2: Inter Process Communication and Deadlock", unit: "Unit 2", name: "Inter Process Communication and Deadlock" },
            { id: "os-u3", title: "Unit 3: Memory Management", unit: "Unit 3", name: "Memory Management" },
            { id: "os-u4", title: "Unit 4: File Management and Administration", unit: "Unit 4", name: "File Management and Administration" }
        ],
        questionBanks: [
            { id: "os-qb1", title: "Unit 1 Question Bank: Process Management & CPU Scheduling", unit: "Unit 1", name: "FCFS, SJF, Round Robin & Process Lifecycle" },
            { id: "os-qb2", title: "Unit 2 Question Bank: Synchronization, IPC & Deadlocks", unit: "Unit 2", name: "Semaphores, Banker's Algorithm & Deadlock Avoidance" },
            { id: "os-qb3", title: "Unit 3 Question Bank: Memory Management & Paging", unit: "Unit 3", name: "Virtual Memory, Page Replacement (LRU/FIFO) & TLB" },
            { id: "os-qb4", title: "Unit 4 Question Bank: File Systems & Disk Scheduling", unit: "Unit 4", name: "FCFS, SSTF, SCAN, LOOK & File Allocation Methods" }
        ]
    })
};

// Aliases for compatibility
subjectsData["math"] = subjectsData["maths"];
subjectsData["coa"] = subjectsData["hardware"];

function loadCustomSubjectsIntoData() {
    try {
        const l1 = JSON.parse(localStorage.getItem('deleted_subjects_list')) || [];
        const l2 = JSON.parse(sessionStorage.getItem('deleted_subjects_list')) || [];
        const l3 = JSON.parse(localStorage.getItem('enh_permanent_deleted_subjects')) || [];
        const deletedList = Array.from(new Set([...l1, ...l2, ...l3])).filter(Boolean);

        localStorage.setItem('deleted_subjects_list', JSON.stringify(deletedList));
        sessionStorage.setItem('deleted_subjects_list', JSON.stringify(deletedList));
        localStorage.setItem('enh_permanent_deleted_subjects', JSON.stringify(deletedList));

        deletedList.forEach(id => {
            delete subjectsData[id];
            if (id === 'maths' || id === 'math') {
                delete subjectsData['maths'];
                delete subjectsData['math'];
            }
            if (id === 'hardware' || id === 'coa') {
                delete subjectsData['hardware'];
                delete subjectsData['coa'];
            }
        });

        let customList = JSON.parse(localStorage.getItem('custom_subjects_list')) || [];
        customList = customList.filter(subj => {
            if (!subj) return false;
            const sId = subj.id || subj.code || '';
            const normId = sId.replace(/_/g, '-');
            const altId = sId.replace(/-/g, '_');
            return !deletedList.includes(sId) && !deletedList.includes(normId) && !deletedList.includes(altId);
        });
        localStorage.setItem('custom_subjects_list', JSON.stringify(customList));

        customList.forEach(subj => {
            if (subj) {
                const sId = subj.id || subj.code || '';
                if (sId && !deletedList.includes(sId)) {
                    subj.id = sId;
                    const subjectInstance = Subject.fromData(subj);
                    subjectsData[sId] = subjectInstance;
                    const normId = sId.replace(/_/g, '-');
                    const altId = sId.replace(/-/g, '_');
                    if (!deletedList.includes(normId)) subjectsData[normId] = subjectInstance;
                    if (!deletedList.includes(altId)) subjectsData[altId] = subjectInstance;
                }
            }
        });

        const modifiedData = JSON.parse(localStorage.getItem('modified_subjects_data')) || {};
        for (const id in modifiedData) {
            const modObj = modifiedData[id];
            if (!modObj) continue;

            const targetKeys = new Set([
                id,
                id.replace(/_/g, '-'),
                id.replace(/-/g, '_')
            ]);
            if (id === 'math' || id === 'maths') {
                targetKeys.add('math');
                targetKeys.add('maths');
            }
            if (id === 'coa' || id === 'hardware') {
                targetKeys.add('coa');
                targetKeys.add('hardware');
            }

            targetKeys.forEach(key => {
                if (deletedList.includes(key)) return;
                if (!subjectsData[key]) {
                    subjectsData[key] = Subject.fromData({ id: key, ...modObj });
                } else {
                    Object.assign(subjectsData[key], modObj);
                }
                if (!subjectsData[key].id) subjectsData[key].id = key;
            });
        }

        // Purge deleted units across all subjects with alias key support
        for (const key in subjectsData) {
            const subj = subjectsData[key];
            if (!subj) continue;

            const targetKeys = new Set([
                key,
                key.replace(/_/g, '-'),
                key.replace(/-/g, '_')
            ]);
            if (key === 'math' || key === 'maths') { targetKeys.add('math'); targetKeys.add('maths'); }
            if (key === 'coa' || key === 'hardware') { targetKeys.add('coa'); targetKeys.add('hardware'); }

            let allDelUnits = [];
            targetKeys.forEach(tKey => {
                ['notes', 'question_bank', 'qb', 'assignments'].forEach(rType => {
                    const delKey = `deleted_units_${tKey}_${rType}`;
                    try {
                        const list = JSON.parse(localStorage.getItem(delKey)) || [];
                        allDelUnits.push(...list);
                    } catch (e) {}
                });
            });

            if (allDelUnits.length > 0) {
                if (subj.chapters) subj.chapters = subj.chapters.filter(u => u && (!u.id || !allDelUnits.includes(u.id)) && (!u.title || !allDelUnits.includes(u.title)));
                if (subj.questionBanks) subj.questionBanks = subj.questionBanks.filter(u => u && (!u.id || !allDelUnits.includes(u.id)) && (!u.title || !allDelUnits.includes(u.title)));
                if (subj.assignments) subj.assignments = subj.assignments.filter(u => u && (!u.id || !allDelUnits.includes(u.id)) && (!u.title || !allDelUnits.includes(u.title)));
            }
        }

        // Ensure all subjects have branches property and purge deleted ones
        for (const key in subjectsData) {
            if (deletedList.includes(key)) {
                delete subjectsData[key];
                continue;
            }
            if (subjectsData[key] && (!subjectsData[key].branches || !Array.isArray(subjectsData[key].branches) || subjectsData[key].branches.length === 0)) {
                subjectsData[key].branches = ["ALL"];
            }
        }

        // Reassign aliases only if subject is not deleted
        if (subjectsData["maths"] && !deletedList.includes("maths") && !deletedList.includes("math")) {
            subjectsData["math"] = subjectsData["maths"];
        } else {
            delete subjectsData["math"];
            delete subjectsData["maths"];
        }

        if (subjectsData["hardware"] && !deletedList.includes("hardware") && !deletedList.includes("coa")) {
            subjectsData["coa"] = subjectsData["hardware"];
        } else {
            delete subjectsData["coa"];
            delete subjectsData["hardware"];
        }
    } catch(e) {
        console.error("Error loading custom subjects into subjectsData:", e);
    }
}
loadCustomSubjectsIntoData();
window.loadCustomSubjectsIntoData = loadCustomSubjectsIntoData;

/**
 * Remove subject ID and all aliases/titles from deletion tombstone lists across storage & DB
 */
function removeSubjectFromDeletedTombstones(idOrTitle) {
    if (!idOrTitle) return;
    const cleanStr = String(idOrTitle).trim();
    if (!cleanStr) return;

    const lowerTarget = cleanStr.toLowerCase();
    const targetSet = new Set([
        cleanStr,
        lowerTarget,
        cleanStr.replace(/_/g, '-'),
        cleanStr.replace(/-/g, '_'),
        lowerTarget.replace(/_/g, '-'),
        lowerTarget.replace(/-/g, '_')
    ]);

    if (lowerTarget === 'coa' || lowerTarget === 'hardware' || lowerTarget.includes('computer organization')) {
        targetSet.add('coa');
        targetSet.add('hardware');
        targetSet.add('computer organization and architecture [coa]');
    }
    if (lowerTarget === 'math' || lowerTarget === 'maths' || lowerTarget.includes('computational mathematics')) {
        targetSet.add('math');
        targetSet.add('maths');
        targetSet.add('oe-1');
        targetSet.add('computational mathematics [oe-1]');
    }
    if (lowerTarget === 'ds' || lowerTarget.includes('data structure')) {
        targetSet.add('ds');
        targetSet.add('data structure [ds]');
    }
    if (lowerTarget === 'os' || lowerTarget.includes('operating system')) {
        targetSet.add('os');
        targetSet.add('operating system and administration [os]');
    }
    if (lowerTarget === 'oop' || lowerTarget.includes('object oriented')) {
        targetSet.add('oop');
        targetSet.add('object oriented programming [oop]');
    }

    if (typeof subjectsData !== 'undefined') {
        for (const k in subjectsData) {
            const s = subjectsData[k];
            if (s) {
                const sId = (s.id || '').toLowerCase();
                const sTitle = (s.title || '').toLowerCase();
                if (targetSet.has(sId) || targetSet.has(sTitle) || sId === lowerTarget || sTitle === lowerTarget) {
                    if (s.id) {
                        targetSet.add(s.id);
                        targetSet.add(s.id.toLowerCase());
                        targetSet.add(s.id.replace(/_/g, '-'));
                        targetSet.add(s.id.replace(/-/g, '_'));
                    }
                    if (s.title) {
                        targetSet.add(s.title);
                        targetSet.add(s.title.toLowerCase());
                    }
                }
            }
        }
    }

    const filterFn = (entry) => {
        if (!entry) return false;
        const entryStr = String(entry).trim();
        const entryLower = entryStr.toLowerCase();
        if (targetSet.has(entryStr) || targetSet.has(entryLower)) return false;
        if (targetSet.has(entryStr.replace(/_/g, '-')) || targetSet.has(entryLower.replace(/_/g, '-'))) return false;
        if (targetSet.has(entryStr.replace(/-/g, '_')) || targetSet.has(entryLower.replace(/-/g, '_'))) return false;
        return true;
    };

    ['deleted_subjects_list', 'enh_permanent_deleted_subjects'].forEach(key => {
        try {
            const list1 = JSON.parse(localStorage.getItem(key)) || [];
            const cleanList1 = list1.filter(filterFn);
            localStorage.setItem(key, JSON.stringify(cleanList1));
        } catch (e) {}

        try {
            const list2 = JSON.parse(sessionStorage.getItem(key)) || [];
            const cleanList2 = list2.filter(filterFn);
            sessionStorage.setItem(key, JSON.stringify(cleanList2));
        } catch (e) {}
    });

    const client = window.supabaseClient || (typeof getSupabaseClient === 'function' ? getSupabaseClient() : null);
    if (client) {
        try {
            const curList = JSON.parse(localStorage.getItem('deleted_subjects_list')) || [];
            client.from('assignments').upsert({
                id: '__deleted_subjects__',
                title: 'Deleted Subjects List Backup',
                unit: 'system',
                question_data_url: JSON.stringify(curList)
            }).then(() => {}).catch(e => console.warn('Tombstone DB purge update warning:', e));
        } catch (e) {}
    }
}
window.removeSubjectFromDeletedTombstones = removeSubjectFromDeletedTombstones;

/**
 * Global Confirm Modal Dialog Helper
 */
window.customConfirm = function(message) {
    return new Promise((resolve) => {
        const backdrop = document.getElementById('confirmModalBackdrop');
        const msgEl = document.getElementById('confirmModalMessage');
        const okBtn = document.getElementById('confirmOkBtn');
        const cancelBtn = document.getElementById('confirmCancelBtn');

        if (!backdrop || !okBtn || !cancelBtn) {
            resolve(window.confirm(message));
            return;
        }

        if (msgEl) msgEl.textContent = message;
        backdrop.style.display = 'flex';

        const cleanup = () => {
            backdrop.style.display = 'none';
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
        };

        const onOk = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
    });
};


const defaultBranchesList = [
    { code: "CE", name: "CE" },
    { code: "CSE", name: "CSE" },
    { code: "IT", name: "IT" },
    { code: "ECE", name: "ECE" },
    { code: "AIDS", name: "AI DS" }
];

function getAvailableBranches() {
    let list = JSON.parse(JSON.stringify(defaultBranchesList));
    try {
        const deletedBranches = JSON.parse(localStorage.getItem('deleted_branches_list')) || [];
        list = list.filter(b => !deletedBranches.includes(b.code));

        const modifiedBranches = JSON.parse(localStorage.getItem('modified_branches_data')) || {};
        list.forEach(b => {
            if (modifiedBranches[b.code]) {
                b.name = modifiedBranches[b.code].name || b.name;
            }
        });

        const customBranches = JSON.parse(localStorage.getItem('custom_branches_list')) || [];
        customBranches.forEach(cb => {
            if (cb && cb.code && !list.some(b => b.code === cb.code)) {
                list.push(cb);
            }
        });
    } catch (e) {
        console.error("Error getting available branches:", e);
    }
    return list;
}
window.getAvailableBranches = getAvailableBranches;
window.defaultBranchesList = defaultBranchesList;

/**
 * Engineering Notes Hub - Navigation & Link Connector Class
 * Central OOP Class to build URLs and bind inter-page navigation links
 */
class NavigationManager {
    static getRelativePrefix() {
        const path = window.location.pathname;
        if (path.includes('/notes/') || path.includes('/question_bank/') || path.includes('/assignments/')) {
            return '../';
        }
        return '';
    }

    static getHomeUrl() {
        const path = window.location.pathname;
        if (path.includes('/login/')) {
            return 'index.html';
        }
        return this.getRelativePrefix() + 'login/index.html';
    }

    static getNotesUrl(subjectKey) {
        const path = window.location.pathname;
        let prefix = '';
        if (path.includes('/notes/')) {
            prefix = '';
        } else if (path.includes('/question_bank/') || path.includes('/assignments/') || path.includes('/login/')) {
            prefix = '../notes/';
        } else {
            prefix = 'notes/';
        }
        const base = `${prefix}viewer.html`;
        return subjectKey ? `${base}?subject=${encodeURIComponent(subjectKey)}&type=notes` : base;
    }

    static getQuestionBankUrl(subjectKey) {
        const path = window.location.pathname;
        let prefix = '';
        if (path.includes('/question_bank/')) {
            prefix = '';
        } else if (path.includes('/notes/') || path.includes('/assignments/') || path.includes('/login/')) {
            prefix = '../question_bank/';
        } else {
            prefix = 'question_bank/';
        }
        const base = `${prefix}viewer.html`;
        return subjectKey ? `${base}?subject=${encodeURIComponent(subjectKey)}&type=qb` : base;
    }

    static getAssignmentsUrl(subjectKey) {
        const path = window.location.pathname;
        let prefix = '';
        if (path.includes('/assignments/')) {
            prefix = '';
        } else if (path.includes('/notes/') || path.includes('/question_bank/') || path.includes('/login/')) {
            prefix = '../assignments/';
        } else {
            prefix = 'assignments/';
        }
        const base = `${prefix}assignments.html`;
        return subjectKey ? `${base}?subject=${encodeURIComponent(subjectKey)}` : base;
    }

    static connectHeaderTabs(subjectKey, activeTab = 'notes') {
        const notesLink = document.getElementById('tabNotesLink') || document.getElementById('notesNavBtn');
        const qbLink = document.getElementById('tabQbLink') || document.getElementById('qbNavBtn');
        const assLink = document.getElementById('tabAssLink') || document.getElementById('assNavBtn');
        const backBtn = document.getElementById('backToHome') || document.querySelector('.back-btn');

        // Check configured subject resources
        let res = { notes: true, qb: true, assignments: true };
        let normKey = subjectKey ? subjectKey.toLowerCase() : '';
        if (normKey === 'math') normKey = 'maths';
        if (normKey === 'coa') normKey = 'hardware';

        if (typeof subjectsData !== 'undefined' && subjectsData[normKey] && subjectsData[normKey].resources) {
            res = subjectsData[normKey].resources;
        }

        const isResEnabled = (val) => val !== false && val !== 'false' && val !== 0 && val !== '0' && val !== undefined;

        if (notesLink) {
            if (isResEnabled(res.notes)) {
                notesLink.style.display = 'inline-flex';
                notesLink.href = this.getNotesUrl(subjectKey);
                if (activeTab === 'notes') notesLink.classList.add('active');
                else notesLink.classList.remove('active');
            } else {
                notesLink.style.display = 'none';
            }
        }
        if (qbLink) {
            if (isResEnabled(res.qb)) {
                qbLink.style.display = 'inline-flex';
                qbLink.href = this.getQuestionBankUrl(subjectKey);
                if (activeTab === 'qb') qbLink.classList.add('active');
                else qbLink.classList.remove('active');
            } else {
                qbLink.style.display = 'none';
            }
        }
        if (assLink) {
            if (isResEnabled(res.assignments)) {
                assLink.style.display = 'inline-flex';
                assLink.href = this.getAssignmentsUrl(subjectKey);
                if (activeTab === 'assignments') assLink.classList.add('active');
                else assLink.classList.remove('active');
            } else {
                assLink.style.display = 'none';
            }
        }
        if (backBtn && backBtn.tagName === 'A') {
            backBtn.href = this.getHomeUrl();
        }
    }

    static navigateTo(url) {
        window.location.href = url;
    }
}
window.NavigationManager = NavigationManager;
window.subjectsData = subjectsData;
