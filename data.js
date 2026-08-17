// Engineering Notes Hub - Study Notes & Question Banks Data
const subjectsData = {
    "dsa": {
        id: "dsa",
        title: "Data Structures",
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
    },
    "oop": {
        id: "oop",
        title: "Object Oriented Programming",
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
    },
    "hardware": {
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
    },
    "maths": {
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
    },
    "os": {
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
    }
};

// Aliases for compatibility
subjectsData["math"] = subjectsData["maths"];
subjectsData["coa"] = subjectsData["hardware"];

