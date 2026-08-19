# 🎓 Engineering Notes Hub (NMIET)

> A modern, interactive web portal providing high-quality study materials, unit-wise question banks, and assignment solutions for engineering students.

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-brightgreen?style=for-the-badge&logo=github)](https://todkarrohit.github.io/NW/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)

---

## 🌐 Live Website

Access the portal live at: **[https://todkarrohit.github.io/NW/](https://todkarrohit.github.io/NW/)**

---

## 🌟 Key Features

- 📚 **Unit-Wise Study Notes**: Complete unit breakdown for Semester 2 subjects with interactive study notes.
- ❓ **Question Banks**: Unit-level question sets curated for exam preparation.
- 📝 **Assignments Portal**: Detailed assignment listings with side-by-side Q&A views and downloadable resources.
- 🔍 **Instant Search & Shortcuts**: Search by subject name, topic, unit, or concept with instant keyboard shortcuts (`Ctrl + K` to search, `Esc` to clear).
- 🌙 **Dark / Light Theme**: Built-in dynamic theme switcher with automatic preference persistence (`localStorage`).
- 🔐 **Admin Management Mode**: Authenticated admin overlay to manage and upload study notes, question banks, and assignments.
- 👥 **Live Online Indicator**: Simulated live active user counter for engagement.
- 📱 **Fully Responsive Layout**: Built with modern CSS Flexbox and Grid, optimizing performance across desktop, tablet, and mobile browsers.

---

## 📖 Subjects Covered

| Code | Subject Name | Units Included |
| :--- | :--- | :--- |
| **DSA** | Data Structure & Algorithm (C++) | Unit 1 (DS & Memory), Unit 2 (Sorting & Searching), Unit 3 (Stack), Unit 4 (Queue) |
| **OOP** | Object-Oriented Programming (C++) | Unit 1 (Fundamentals), Unit 2 (Inheritance & Polymorphism), Unit 3 (Exceptions), Unit 4 (File Handling) |
| **OS** | Operating System | Unit 1 (Process Management), Unit 2 (IPC & Deadlocks), Unit 3 (Memory Management), Unit 4 (File Management) |
| **MATH** | Engineering Mathematics | Unit 1 (Logic & Sets), Unit 2 (Relations), Unit 3 (Fourier & Z-Transforms), Unit 4 (Statistics), Unit 5 (Numerical Methods) |
| **COA** | Computer Hardware & Organization | Unit 1 (Data Representation), Unit 2 (Computer Design), Unit 3 (Pipelining), Unit 4 (I/O Organization) |

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Properties, Glassmorphism, Responsive Layouts)
- **Scripting & Logic**: JavaScript (ES6+, DOM Manipulation, LocalStorage API, URLSearchParams)
- **UI Components & Icons**: Font Awesome 6, Google Fonts (`Plus Jakarta Sans`)
- **Hosting**: GitHub Pages

---

## 📂 Project Structure

```
NW/
├── index.html          # Main landing page with subject cards and search
├── viewer.html         # Document viewer for Study Notes & Question Banks
├── assignments.html    # Assignments portal page
├── data.js             # Data structure containing subjects, units, and question banks
├── script.js           # Main page logic (Search, Admin modal, Online counter)
├── viewer.js           # Viewer functionality & resource tab routing
├── assignments.js      # Assignment portal filtering & side-by-side preview logic
├── styles.css          # Core styles & CSS custom property variables (Theme Engine)
├── viewer.css          # Resource viewer styling
├── assignments.css     # Assignment portal styling
├── logo.png / logo1.png# Project branding images
└── README.md           # Project documentation
```

---

## 🚀 Quick Start & Local Usage

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TodkarRohit/NW.git
   cd NW
   ```

2. **Run Locally**:
   Simply open `index.html` in any web browser (no build steps or server setup required).
   
   *Or use Python Simple Server*:
   ```bash
   python -m http.server 8000
   ```
   Navigate to `http://localhost:8000`.

---

## 👥 Developers & Credits

Developed with ❤️ by NMIET Students:

- **Rohit Todkar** - [GitHub Profile](https://github.com/TodkarRohit)
- **Pratik Shendge**
- **Onkar Pawar** - [GitHub Profile](https://github.com/onkarpawar158-coder)

---

## 📄 License

This project is created for educational and academic reference purposes for NMIET Engineering students.