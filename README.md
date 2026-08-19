# Engineering Notes Hub

Academic resource and study portal for engineering students featuring study notes, question banks, assignments with model answers, and a secure backend powered by Node.js, Express, MongoDB, Mongoose, JWT authentication, and Google Drive Option A integration.

---

## 🌟 Overview & Features

- **Public & Optional Login**: All primary study materials (Home, Notes, Question Banks, Assignments, and PDFs) are 100% accessible to anyone without requiring an account or login.
- **Secure Authentication**:
  - User registration & login with JWT tokens (`Authorization: Bearer <token>`).
  - **Strict 8-character username requirement** (letters, numbers, and allowed characters).
  - Password hashing with **bcrypt** (salt rounds: 10).
  - Passwords and password hashes are never stored in plain text and **never exposed** in API responses.
- **Google Drive — Option A Integration**:
  - Fully decoupled from Google Drive API (no Google credentials, OAuth tokens, or passwords stored or required).
  - Secure server-side validation of manually shared Google Drive URLs (`driveValidator.js`).
  - Automatic generation of safe embed preview links for PDFs.
- **Modern Responsive Frontend**:
  - Fast search with instant keyboard shortcuts (`Ctrl + K`, `Esc`).
  - Dark Mode and Light Mode with persistent preference.
  - Interactive sidebar chapter navigator, side-by-side Q&A panels, and PDF viewers.

---

## 📁 Project Architecture & Structure

```
d:\project_hackethon\NW\
├── index.html                  # Academic portal home page (Subjects grid & search)
├── viewer.html                 # 2-panel study notes and question banks viewer
├── viewer.css                  # Viewer layout and responsive styling
├── viewer.js                   # Viewer navigation, search filter, and document tabs
├── assignments.html            # Assignments portal (Side-by-side Q&A and PDF preview)
├── assignments.css             # Assignments grid, comment drawer, and modal styling
├── assignments.js              # Assignments state, unit filters, and discussion drawer
├── auth.js                     # Frontend auth service & JWT session management
├── data.js                     # Course syllabus, chapters, and question bank metadata
├── styles.css                  # Core design tokens, global themes, and auth modal styles
├── logo.png                    # Portal branding asset
├── .gitignore                  # Root Git ignore rules (node_modules, .env)
├── README.md                   # Complete documentation
│
└── server/                     # Modular Node.js Backend
    ├── server.js               # Express application entry point & CORS configuration
    ├── package.json            # Backend dependencies and npm scripts
    ├── test_suite.js           # Automated backend verification test suite (43 test cases)
    ├── .env                    # Local environment variables (Ignored by Git)
    ├── .env.example            # Environment template with placeholders
    ├── .gitignore              # Server Git ignore rules
    │
    ├── config/
    │   └── db.js               # MongoDB Mongoose connection manager with reconnect handling
    │
    ├── models/
    │   ├── User.js             # Mongoose User model (8-char username, bcrypt, safe toJSON)
    │   └── Resource.js         # Mongoose Resource model (Google Drive metadata & links)
    │
    ├── middleware/
    │   ├── authMiddleware.js   # JWT verification (protect) & optional authentication
    │   ├── validationMiddleware.js # 8-character username, password & Drive link validation
    │   └── errorMiddleware.js  # Centralized error handler returning consistent JSON
    │
    ├── controllers/
    │   ├── authController.js   # Register, Login, Logout, and Current User endpoints
    │   ├── userController.js   # Protected user listing controller
    │   └── resourceController.js # Public resource browsing & protected resource management
    │
    ├── routes/
    │   ├── authRoutes.js       # /api/auth routes
    │   ├── userRoutes.js       # /api/users routes
    │   └── resourceRoutes.js   # /api/resources routes
    │
    └── utils/
        ├── driveValidator.js   # Google Drive URL validator & embed URL generator
        └── tokenUtils.js       # JWT sign and verify helpers
```

---

## 🔒 Security Practices

1. **Password Protection**: Passwords are automatically hashed using bcrypt with salt rounds before being stored in MongoDB.
2. **Safe Serialization**: The `User` Mongoose schema overrides `.toJSON()` to delete the `password` field from any serialization, preventing accidental leaks in JSON responses or console logs.
3. **Strict 8-Character Username Rule**: The backend enforces `username.length === 8` at both the validation middleware level and the Mongoose model schema level.
4. **JWT Authentication**: JWT tokens are signed using a server-side `JWT_SECRET`. Tokens are transmitted via standard HTTP header: `Authorization: Bearer <token>`.
5. **No Credential Leaks**: Neither Google credentials, database passwords, nor JWT secrets are exposed to the frontend or checked into version control.
6. **Centralized Error Handling**: Standardized JSON responses for all errors:
   ```json
   {
     "success": false,
     "message": "Clear user-friendly error description"
   }
   ```

---

## ⚠️ Google Drive Option A Safety & Limitations

> [!IMPORTANT]
> **Google Drive Option A Security Limitation**:
> Because the website uses Google Drive Option A (manual share links without Google Drive API), access to the underlying file is determined by the sharing permissions configured in Google Drive.
> 
> **Best Practices**:
> - Only create share links for files intended to be public for students.
> - Use a dedicated Google account specifically for website materials.
> - Never share personal Google Drive folders or private documents.
> - The backend validates URLs to ensure they point only to legitimate `drive.google.com` or `docs.google.com` resources.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

---

### Step 1: Install Backend Dependencies

Open PowerShell and navigate to the `server/` directory:

```powershell
cd d:\project_hackethon\NW\server
npm install
```

Installed packages:
- `express`: Fast web framework for API routes.
- `mongoose`: MongoDB object modeling and validation.
- `jsonwebtoken`: Secure JWT token creation and verification.
- `bcryptjs`: Password hashing and comparison.
- `dotenv`: Loads environment variables from `.env`.
- `cors`: Cross-Origin Resource Sharing middleware.

---

### Step 2: Configure Environment Variables

Create or edit `server/.env` (a template is provided in `server/.env.example`):

```env
# Server Port
PORT=5000

# MongoDB Database URI (Local or MongoDB Atlas)
MONGO_URI=mongodb://127.0.0.1:27017/engineering_notes_hub

# JWT Secret Key (Use a strong random secret in production)
JWT_SECRET=your_jwt_secret_key_change_in_production

# CORS Allowed Origins
CORS_ORIGIN=*
```

---

### Step 3: Start the Backend Server

Run in PowerShell:

```powershell
# Development mode with auto-reload
node --watch server.js

# Or standard production start
node server.js
```

You should see:
```
[Server] Engineering Notes Hub backend listening on port 5000
[Server] Mode: development
[Database] MongoDB Connected: 127.0.0.1/engineering_notes_hub
```

---

### Step 4: Run the Backend Test Suite

To verify all 43 automated security and functionality tests:

```powershell
cd d:\project_hackethon\NW\server
node test_suite.js
```

---

### Step 5: Launch the Frontend

You can open `index.html` directly in any web browser, or serve it using any static server (e.g. VS Code Live Server, http-server, or Python):

```powershell
# Option A: Open directly in default browser
start d:\project_hackethon\NW\index.html

# Option B: Run a local static server (optional)
npx serve d:\project_hackethon\NW
```

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register with 8-char username & password. Returns JWT token & safe user info. |
| `POST` | `/api/auth/login` | Public | Authenticate with username & password. Returns JWT token. |
| `POST` | `/api/auth/logout` | Public | Clear session notification. |
| `GET` | `/api/auth/me` | Private | Returns current authenticated user profile. |

#### Registration Request Body:
```json
{
  "username": "student1",
  "password": "SecurePassword@123"
}
```

#### Registration / Login Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67b5e4a8f9c1a2b3c4d5e6f7",
    "username": "student1",
    "createdAt": "2026-08-19T12:00:00.000Z"
  }
}
```

---

### User Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Private | Returns sanitized list of registered users (`_id`, `username`, `createdAt`). |

#### Header Required:
```http
Authorization: Bearer <token>
```

---

### Study Resource Endpoints (Google Drive Links)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/resources` | Public | Browse public study resources (Optional query filters: `?subject=dsa&type=notes`). |
| `POST` | `/api/resources` | Private | Add a verified Google Drive study resource link. |
| `DELETE` | `/api/resources/:id` | Private | Remove a study resource link. |

#### Create Resource Request Body:
```json
{
  "title": "Unit 1: Data Structures Overview",
  "subject": "dsa",
  "description": "Complete unit notes with memory representations",
  "type": "notes",
  "unit": "Unit 1",
  "googleDriveUrl": "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/view?usp=sharing"
}
```

---

### System Health Check

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Returns API uptime status and timestamp. |

---

## 🚢 Deployment Guide

1. **Deploy Backend (e.g. Render, Railway, DigitalOcean, AWS)**:
   - Set Environment Variables: `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`.
   - Build Command: `cd server && npm install`
   - Start Command: `node server/server.js`
2. **Deploy Frontend (e.g. GitHub Pages, Vercel, Netlify)**:
   - In `auth.js`, update `API_BASE_URL` to point to your live backend domain (e.g. `https://api.yourdomain.com/api`).
   - Push repository to GitHub Pages or your preferred static host.

---

## 👥 Contributors

- **Rohit Todkar** - [GitHub](https://github.com/TodkarRohit)
- **Pratik Shendge**
- **Onkar Pawar** - [GitHub](https://github.com/onkarpawar158-coder)

*Engineering Notes Hub &copy; 2026. Built for NMIET Students.*