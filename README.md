# NEU Library Visitor Log System

A web-based Library Visitor Log System for New Era University, built with React and Firebase. This system allows students, faculty, and staff to log their library visits, while administrators can monitor visitor statistics and manage user access.

---

## 🌐 Live Demo
https://neu-library-15439.web.app/

---

## ✨ Features

### Visitor Portal
- Google Sign-In using @neu.edu.ph institutional account
- First-time onboarding to set up user type and college/office
- Log library visits with reason for visit
- Welcome screen after successful check-in

### Admin Portal
- View visitor logs filtered by today, week, month, or custom date range
- Visual breakdown of visitors by college/office
- Search user by email and view complete visit history
- Block and unblock users from accessing the system
- View library schedule

---

## 🛠 Tech Stack
- **Frontend:** React.js
- **Backend:** Firebase Firestore
- **Authentication:** Firebase Auth (Google Sign-In)
- **Hosting:** Firebase Hosting

---

## 👥 User Roles

| Role | Access |
|---|---|
| User | Onboarding + Check-in + Welcome screen |
| Admin | Full dashboard + Visitor logs + User management |

---

## 📋 Reasons for Visit
- Borrowing / Returning Books
- Thesis / Research Work
- Quiet Study
- Group Study
- Use of Library Computers
- Attendance to Library Event
- Other

---

## 🚀 Setup & Installation

### 1. Clone the repository
git clone https://github.com/MicoleKurt/Neu-Library.git
cd Neu-Library

### 2. Install dependencies
npm install

### 3. Add Firebase config
Open src/firebase/config.js and paste your Firebase project credentials.

### 4. Add local assets
Place your image files in src/assets/:
- neu-library-logo.png
- neu-library-sched.jpg

### 5. Run locally
npm start

### 6. Build and deploy
npm run build
firebase deploy

---

## 🔑 Setting Up Admin Account
1. Sign in to the app at localhost:3000 using your @neu.edu.ph Google account
2. Complete the onboarding setup
3. Go to Firebase Console → Firestore Database → users collection
4. Find your document → change role field from user to admin
5. Refresh the app — Admin Dashboard will appear

---

## 📁 Project Structure

neu-library/
├── src/
│   ├── firebase/
│   │   └── config.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── assets/
│   │   ├── neu-library-logo.png
│   │   └── neu-library-sched.jpg
│   ├── components/
│   │   └── ProtectedRoute.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── OnboardingPage.js
│   │   ├── CheckInPage.js
│   │   ├── WelcomePage.js
│   │   └── AdminDashboard.js
│   └── App.js
├── public/
│   └── index.html
├── firebase.json
└── package.json

---

## 🗺 App Flow

| Page | Who Sees It | What It Does |
|---|---|---|
| / | Everyone | Google Sign-In with @neu.edu.ph check |
| /onboarding | First-time users | Select user type and college/office |
| /checkin | Returning users | Choose reason for visit |
| /welcome | After check-in | Welcome to NEU Library success screen |
| /admin | Admin only | Stats, logs, user search, block users |

---

## 👩‍💻 Developer
**Micole Kurt Gonda**
New Era University — College of Informatics and Computing Studies (CICS)
Professional Elective 2 — Personal Project
Academic Year 2025–2026

---

© 2026 New Era University · All rights reserved
