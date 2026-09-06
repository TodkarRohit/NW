# Software Requirements Specification (SRS)
## Engineering Notes Hub (NW Portal)

**Version:** 1.0.0  
**Status:** Approved & Released  
**Target Audience:** Students, Faculty, Administrators, and Developers  

---

## Table of Contents
1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
   - 1.2 [Scope](#12-scope)
   - 1.3 [Definitions & Acronyms](#13-definitions--acronyms)
   - 1.4 [References](#14-references)
2. [Overall Description](#2-overall-description)
   - 2.1 [Product Perspective](#21-product-perspective)
   - 2.2 [Product Functions](#22-product-functions)
   - 2.3 [User Classes & Characteristics](#23-user-classes--characteristics)
   - 2.4 [Operating Environment](#24-operating-environment)
   - 2.5 [Design Constraints](#25-design-constraints)
3. [System Features & Functional Requirements](#3-system-features--functional-requirements)
   - 3.1 [Authentication & Access Control](#31-authentication--access-control)
   - 3.2 [Notes & Question Bank Modules](#32-notes--question-bank-modules)
   - 3.3 [Assignments Portal & Discussion Engine](#33-assignments-portal--discussion-engine)
   - 3.4 [Supabase Storage & Inline PDF Rendering](#34-supabase-storage--inline-pdf-rendering)
   - 3.5 [Search & Multi-Branch Navigation](#35-search--multi-branch-navigation)
   - 3.6 [Theme & UI Customization](#36-theme--ui-customization)
4. [Non-Functional Requirements](#4-non-functional-requirements)
   - 4.1 [Security](#41-security)
   - 4.2 [Performance](#42-performance)
   - 4.3 [Reliability & Availability](#43-reliability--availability)
   - 4.4 [Usability & Responsiveness](#44-usability--responsiveness)
5. [Data Models & Database Schemas](#5-data-models--database-schemas)
   - 5.1 [Supabase PostgreSQL Schema](#51-supabase-postgresql-schema)
   - 5.2 [MongoDB Mongoose Schema](#52-mongodb-mongoose-schema)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document defines the complete functional and non-functional requirements for the **Engineering Notes Hub (NW Portal)**. It serves as the authoritative technical reference for developers, system architects, and academic administrators.

### 1.2 Scope
The Engineering Notes Hub is a web portal designed to distribute academic resources (study notes, question banks, assignments with model answers, and PDFs) for engineering students across multiple branches (CE, CSE, IT, ECE, AI DS). It operates as a high-performance web application hosted on GitHub Pages with serverless cloud database integration (Supabase) alongside an optional modular Node.js/Express REST backend.

### 1.3 Definitions & Acronyms
- **JWT**: JSON Web Token used for secure API session management.
- **RLS**: Row Level Security (PostgreSQL security policy enforced by Supabase).
- **SPA**: Single Page Application.
- **Supabase**: Backend-as-a-Service (BaaS) providing PostgreSQL and Storage services.
- **Bcrypt**: Password hashing function with salt rounds.

### 1.4 References
- Portal Live Web App: [https://todkarrohit.github.io/NW/](https://todkarrohit.github.io/NW/)
- GitHub Repository: [https://github.com/todkarrohit/NW](https://github.com/todkarrohit/NW)

---

## 2. Overall Description

### 2.1 Product Perspective
The portal addresses the challenge of fragmented academic resources by consolidating study materials into a unified platform. It provides friction-free access to study materials without mandatory logins while enforcing strict role-based access for content uploads and management.

### 2.2 Product Functions
- **Resource Browsing**: Public access to all notes, question banks, and assignments.
- **Side-by-Side Viewing**: Dual-panel interfaces for questions and model answers with embedded PDF previewing.
- **Admin Management**: Secure login for authorized administrators to upload, edit, or delete assignments, notes, and question banks.
- **Discussion System**: Interactive comment drawer per assignment stored in JSONB columns.
- **Real-Time Search**: Instant keyword filtering across subject names, codes, and topics.
- **Theme Persistence**: Global dark/light theme switcher with persistent local storage.

### 2.3 User Classes & Characteristics
1. **Guest Student**:
   - Capabilities: Search, view, filter, preview PDFs, read and post discussion comments, download academic files.
   - Requirements: No registration or login required.
2. **Verified Administrator**:
   - Capabilities: All guest capabilities plus file upload privileges, custom assignment creation, assignment deletion, resource management.
   - Credentials: Verified in Supabase database (`is_admin: true` or registered admin credentials).

### 2.4 Operating Environment
- **Client Side**: Modern HTML5/CSS3/JavaScript ES6+ web browsers (Chrome, Edge, Firefox, Safari).
- **Hosting**: GitHub Pages static website hosting.
- **Cloud Backend**: Supabase Cloud (PostgreSQL 15+ database and S3-compatible Object Storage).
- **Optional Backend**: Node.js v18+, Express, MongoDB 6+.

---

## 3. System Features & Functional Requirements

### 3.1 Authentication & Access Control
- **FR-AUTH-01**: System shall support user login via username or email address.
- **FR-AUTH-02**: System shall validate administrator status in database (`is_admin: true`).
- **FR-AUTH-03**: Passwords must be hashed using `bcrypt` (10 salt rounds) and never exposed in network responses.
- **FR-AUTH-04**: Client session shall persist `isAdminMode` in `localStorage` upon successful admin login.

### 3.2 Notes & Question Bank Modules
- **FR-NOTE-01**: Provide a 2-panel viewer interface with a dynamic chapter navigator.
- **FR-NOTE-02**: Render PDF previews inline using embedded viewers with proper `application/pdf` headers.
- **FR-NOTE-03**: Display view counters and download counters incrementing upon user interaction.

### 3.3 Assignments Portal & Discussion Engine
- **FR-ASSG-01**: Group assignments by units (Unit 1 to Unit 6, All Units filter).
- **FR-ASSG-02**: Provide side-by-side question and model solution preview.
- **FR-ASSG-03**: Enable an interactive comment/discussion drawer for each assignment.
- **FR-ASSG-04**: Support dual file uploads (Question PDF + Answer PDF) for admins.

### 3.4 Supabase Storage & Inline PDF Rendering
- **FR-STOR-01**: Upload files to the `academic-files` storage bucket.
- **FR-STOR-02**: Automatically pass `contentType: 'application/pdf'` during file upload to enable native inline browser viewing instead of forcing automatic downloads.

### 3.5 Search & Multi-Branch Navigation
- **FR-SRCH-01**: Filter subjects by engineering branch (CE, CSE, IT, ECE, AI DS).
- **FR-SRCH-02**: Provide real-time instant search input with keyboard shortcut support (`Esc` clear search).

### 3.6 Theme & UI Customization
- **FR-UI-01**: Global toggle for Dark Mode and Light Mode.
- **FR-UI-02**: Persist selected theme in `localStorage.getItem('nw_theme')`.

---

## 4. Non-Functional Requirements

### 4.1 Security
- **NFR-SEC-01**: Passwords must never be stored or logged in plain text.
- **NFR-SEC-02**: Supabase Row Level Security (RLS) policies must govern table SELECT, INSERT, UPDATE, DELETE operations.
- **NFR-SEC-03**: Admin actions in UI must be restricted strictly to authenticated admin users.

### 4.2 Performance
- **NFR-PERF-01**: Initial page load time must be under 1.5 seconds on broadband connections.
- **NFR-PERF-02**: Search filtering response time must be under 50ms (instant DOM search).

### 4.3 Reliability & Availability
- **NFR-REL-01**: System availability target of 99.9% backed by GitHub Pages CDN and Supabase cloud infrastructure.

### 4.4 Usability & Responsiveness
- **NFR-USE-01**: Responsive layout supporting Desktop (1200px+), Tablet (768px-1199px), and Mobile (<768px).

---

## 5. Data Models & Database Schemas

### 5.1 Supabase PostgreSQL Schema

#### `public.assignments`
```sql
CREATE TABLE public.assignments (
    id TEXT PRIMARY KEY,
    subject_key TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    unit TEXT,
    chapter_title TEXT,
    num INT,
    title TEXT NOT NULL,
    question_file TEXT NOT NULL,
    answer_file TEXT NOT NULL,
    question_data_url TEXT NOT NULL,
    answer_data_url TEXT NOT NULL,
    question_preview TEXT,
    answer_preview TEXT,
    views INT DEFAULT 0,
    downloads INT DEFAULT 0,
    is_custom BOOLEAN DEFAULT true,
    comments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `public.users`
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'user',
    login_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_login_at TIMESTAMPTZ
);
```

### 5.2 MongoDB Mongoose Schema (Node Backend)

#### `User` Model
- `username`: String (required, unique, length === 8)
- `email`: String (required, unique)
- `password`: String (hashed with bcrypt, excluded from `.toJSON()`)
- `role`: String (enum: `['user', 'admin']`)

#### `Resource` Model
- `title`: String (required)
- `subjectCode`: String (required)
- `type`: String (enum: `['notes', 'question_bank', 'assignment']`)
- `driveUrl`: String (validated Google Drive URL)
- `embedUrl`: String (generated preview URL)
