# 🎓 Engineering Notes Hub (NW Portal)

[![Live Demo](https://img.shields.io/badge/Live_Portal-GitHub_Pages-brightgreen?style=for-the-badge&logo=github)](https://todkarrohit.github.io/NW/)
[![Documentation](https://img.shields.io/badge/SRS_Document-IEEE_Standard-blue?style=for-the-badge&logo=markdown)](./SRS_DOCUMENT.md)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5_CSS3_JS-E34F26?style=for-the-badge&logo=html5)](#)
[![Backend](https://img.shields.io/badge/Backend-Node.js_Express_MongoDB-339933?style=for-the-badge&logo=nodedotjs)](#)

> A modern, interactive academic resource portal for engineering students featuring study notes, unit-level question banks, side-by-side assignment model answers, inline PDF rendering, and an admin content management system.

---

## 🌐 Live Portal Access

🚀 Access the live deployed application: **[https://todkarrohit.github.io/NW/](https://todkarrohit.github.io/NW/)**  
📄 View full technical specification: **[Software Requirements Specification (SRS Document)](./SRS_DOCUMENT.md)**

---

## 📐 System Architecture & Visual Diagrams

### 1. High-Level System Architecture
The portal operates on a flexible hybrid architecture with a zero-friction client hosted on GitHub Pages, connected to Supabase serverless database/storage, and an optional modular Node.js/Express REST backend.

```mermaid
graph TD
    subgraph Client ["Client Layer (Browser)"]
        UI["Web Interface (HTML5/CSS3/ES6)"]
        Search["Instant Search Engine"]
        Theme["Theme Engine (Dark/Light)"]
        PDF["Inline PDF Viewer"]
    end

    subgraph Hosting ["Static Hosting Layer"]
        GHP["GitHub Pages CDN"]
    end

    subgraph Supabase ["Cloud Backend (Supabase)"]
        DB[(PostgreSQL Database)]
        Storage[(Academic Files Storage)]
        RLS["Row Level Security Policies"]
    end

    subgraph NodeBackend ["Optional REST Backend"]
        Express["Node.js / Express Server"]
        MongoDB[(MongoDB Database)]
        JWT["JWT Auth & Drive Validator"]
    end

    UI -->|Static Delivery| GHP
    UI -->|Queries & Updates| DB
    UI -->|Upload & Embed PDFs| Storage
    DB --- RLS
    Storage --- RLS
    UI -.->|Optional REST API| Express
    Express --- MongoDB
    Express --- JWT
```

---

### 2. User & Admin Authorization Flow
Guest users enjoy 100% unrestricted access to read and download study resources. Admin status is strictly validated prior to allowing content upload, editing, or deletion.

```mermaid
flowchart TD
    Start([User Opens Portal]) --> AccessPublic[Access Study Notes, Question Banks & Assignments]
    AccessPublic --> ActionChoice{User Action?}
    
    ActionChoice -->|View / Search / Download| PublicView[Render Side-by-Side Viewers & Inline PDFs]
    ActionChoice -->|Post Comment| SubmitComment[Save Comment to Assignment JSONB]
    ActionChoice -->|Toggle Admin Mode| AdminModal[Open Admin Authentication Overlay]

    AdminModal --> EnterCredentials[Enter Username / Email & Password]
    EnterCredentials --> VerifyAuth{Authenticate against Supabase / Express}
    
    VerifyAuth -->|Success & Admin Role| GrantAdmin[Set Admin Mode = True in LocalStorage]
    VerifyAuth -->|Failure or Regular User| DenyAdmin[Show Error Toast & Revert to Guest]

    GrantAdmin --> EnableAdminUI[Display Upload Buttons & Delete Triggers]
    EnableAdminUI --> AdminUpload[Upload Question & Solution PDFs to Supabase Storage]
```

---

### 3. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        uuid id PK
        string username UK
        string email UK
        string password_hash
        boolean is_admin
        string role
        int login_count
        timestamp created_at
    }

    ASSIGNMENTS {
        string id PK
        string subject_key
        string chapter_id
        string unit
        string chapter_title
        string title
        string question_file
        string answer_file
        string question_data_url
        string answer_data_url
        int views
        int downloads
        boolean is_custom
        jsonb comments
        timestamp created_at
    }

    STORAGE_OBJECTS {
        string id PK
        string bucket_id FK
        string name
        string content_type
        timestamp created_at
    }

    USERS ||--o{ ASSIGNMENTS : "manages"
    ASSIGNMENTS ||--|{ STORAGE_OBJECTS : "links to uploaded PDFs"
```

---

## 🌟 Accomplishments & Completed Features Matrix

Below is the verified summary of all completed features, UI fixes, and security enhancements in the platform:

| Feature / Fix | Category | Description / Resolution |
| :--- | :--- | :--- |
| **Strict Admin Role Guards** | Security | Content uploads and deletions are strictly guarded by verified `is_admin: true` database roles. |
| **Dual PDF Upload Engine** | Uploads | Upload dual PDFs (Question + Answer) directly to Supabase `academic-files` storage bucket. |
| **Inline PDF Viewer** | PDF Viewing | Ensured files upload with `contentType: application/pdf` to render directly inline in browser frames instead of triggering forced downloads. |
| **Theme Switcher** | UI / UX | Dark & Light mode toggle with persistent preference stored across sessions in `localStorage`. |
| **Interactive Discussion Drawer** | Discussion | Assignment-level comment drawer storing real-time feedback in Supabase JSONB arrays. |
| **Cloud State & Selection Memory** | Persistence | Published items, custom uploads, and active unit selection persist 100% across page reloads/refreshes. |
| **Mobile Drawer & Responsive Grid** | Layout | CSS Grid and Flexbox layout tuned for desktop, tablet, and mobile browsers. |
| **Automated Backend Test Suite** | Testing | Modular Express backend verified with 43 automated unit and integration tests (`test_suite.js`). |

---

## 📖 Subjects Covered

| Subject Code | Full Name | Included Units |
| :--- | :--- | :--- |
| **DSA** | Data Structure & Algorithm (C++) | Unit 1 (DS & Memory), Unit 2 (Sorting & Searching), Unit 3 (Stack), Unit 4 (Queue) |
| **OOP** | Object-Oriented Programming (C++) | Unit 1 (Fundamentals), Unit 2 (Inheritance & Polymorphism), Unit 3 (Exceptions), Unit 4 (File Handling) |
| **OS** | Operating System | Unit 1 (Process Management), Unit 2 (IPC & Deadlocks), Unit 3 (Memory Management), Unit 4 (File Management) |
| **MATH** | Engineering Mathematics | Unit 1 (Logic & Sets), Unit 2 (Relations), Unit 3 (Fourier & Z-Transforms), Unit 4 (Statistics), Unit 5 (Numerical Methods) |
| **COA** | Computer Hardware & Organization | Unit 1 (Data Representation), Unit 2 (Computer Design), Unit 3 (Pipelining), Unit 4 (I/O Organization) |

---

## 🛠️ Tech Stack & Dependencies

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design Tokens, Glassmorphism, CSS Variables), Modern ES6+ JavaScript.
- **Iconography & Fonts**: Font Awesome 6, Google Fonts (`Plus Jakarta Sans`).
- **Cloud Database & Storage**: Supabase PostgreSQL + Supabase S3 Object Storage.
- **Backend (Optional)**: Node.js, Express, MongoDB (Mongoose), JWT (`jsonwebtoken`), `bcryptjs`.
- **Hosting**: GitHub Pages CDN.

---

## 📁 Repository Structure

```
NW/
├── index.html                  # Portal entrance (Redirects to landing page)
├── SRS_DOCUMENT.md             # IEEE Software Requirements Specification
├── README.md                   # Visual project documentation
├── setup_assignments_db.sql    # Supabase PostgreSQL table & RLS policies script
├── setup_storage.sql           # Supabase Storage bucket & policies script
│
├── login/                      # Portal Main Landing Page
│   ├── index.html              # Subject cards, branch filters, search & header
│   └── script.js               # Landing page interactivity & search logic
│
├── notes/                      # Study Notes Module
│   ├── viewer.html             # 2-Panel interactive study notes viewer
│   ├── viewer.css              # Viewer styles
│   └── viewer.js               # Chapter navigator & PDF preview loader
│
├── question_bank/              # Question Bank Module
│   ├── viewer.html             # Unit-wise question bank viewer
│   ├── viewer.css              # Question bank styling
│   └── viewer.js               # Question bank interaction logic
│
├── assignments/                # Assignments Portal
│   ├── assignments.html        # Assignments grid, modal previews & discussion drawer
│   ├── assignments.css         # Assignment layout & modal styling
│   └── assignments.js          # Dual PDF upload, comments & filter logic
│
├── assets/                     # Shared Assets & Libraries
│   ├── auth.js                 # Authentication service & session manager
│   ├── auth-modal.js           # Admin login modal overlay controller
│   ├── data.js                 # Course syllabus & metadata definition
│   └── styles.css              # Core design tokens & global themes
│
└── server/                     # Optional Node.js/Express REST Backend
    ├── server.js               # Express application entry point
    ├── package.json            # Node backend dependencies
    ├── test_suite.js           # Automated test suite (43 test cases)
    ├── config/db.js            # MongoDB connection configuration
    ├── models/                 # Mongoose data schemas (User.js, Resource.js)
    ├── middleware/             # Express middlewares (JWT auth, validation, errors)
    ├── controllers/            # Route handler logic
    └── utils/                  # Google Drive validator & JWT token helpers
```

---

## 🚀 Quick Start & Local Development

### 1. Run Static Frontend Immediately
Simply clone the repository and open `login/index.html` in any browser:
```bash
git clone https://github.com/TodkarRohit/NW.git
cd NW
start login/index.html
```

Or spin up a lightweight local HTTP server:
```bash
npx serve .
```

---

### 2. Optional: Run Modular Node.js / Express Backend
```bash
cd server
npm install
node server.js
```
To run the automated backend test suite (43 tests):
```bash
node test_suite.js
```

---

## 👥 Authors & Contributors

Developed with ❤️ for NMIET Engineering Students:

- **Rohit Todkar** - [GitHub Profile](https://github.com/TodkarRohit)
- **Pratik Shendge**
- **Onkar Pawar** - [GitHub Profile](https://github.com/onkarpawar158-coder)

---

## 📄 License

This project is licensed for academic and educational reference for NMIET Engineering students.
