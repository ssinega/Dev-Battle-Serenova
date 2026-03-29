Problem Statement :
Patients need a secure and confidential platform to access mental health services and resources

Solution:

# 🛡️ Serenova: Secure Mental Health & Wellness Platform

Serenova is a comprehensive, secure, and privacy-first mental health platform designed to connect patients with licensed therapists. Built with modern web technologies, it offers a seamless and confidential environment for mental health support, featuring real-time communication, encrypted journaling, and a localized database for effortless local development.

---

## 🚀 Key Features

- **🔐 Privacy & Security First**: 
    - Full end-to-end data safety using AES-256 for journal entries and session messages.
    - Two-Factor Authentication (2FA) and optional Incognito Mode.
    - JWT-based authentication with secure HTTP-only cookies.
- **🩺 Therapist Ecosystem**:
    - Comprehensive directory with advanced filtering (specialty, language, session type).
    - Session booking system with automated availability management.
- **💬 Real-time Sessions**:
    - Secure real-time chat via Socket.io.
    - Ready-to-integrate Video/Audio session UI.
- **📓 Personal Wellness Tools**:
    - **Encrypted Journal**: A private space for reflection with mood tagging.
    - **Mood Heatmap**: Visual insights into emotional trends over time.
    - **Resource Library**: Curated mental health articles and exercises.
- **🚨 Crisis Support**: 
    - Region-specific emergency contacts and personalized "Safety Plan" builder.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (with Glassmorphism aesthetic)
- **Animations**: Framer Motion (page transitions & micro-interactions)
- **State Management**: Zustand
- **Graphics**: Recharts (Mood charts), Lucide React (Icons)
- **Forms**: React Hook Form + Zod (Strict validation)

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: SQLite (Local-first, no Docker needed)
- **ORM**: Prisma
- **Real-time**: Socket.io
- **Security**: Bcrypt (Hash), JWT (Auth), AES-256 (Encryption)

---

## 📦 Project Structure

```text
serenova/
├── backend/            # Express API & Prisma Schema
│   ├── prisma/         # Database models & seed data
│   └── src/            # Controllers, Routes, Middleware, Sockets
└── frontend/           # React Frontend App
    ├── src/
    │   ├── api/        # Axios service layer
    │   ├── components/ # Reusable UI components
    │   ├── hooks/      # Custom React hooks (Socket, Auth)
    │   └── pages/      # Application views
```

---

## ⚡ Quick Start (Setup)

### 1. Prerequisite
Ensure you have **Node.js (v18+)** installed on your machine.

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the App
Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Patient** | `patient@demo.com` | `Demo@1234` |
| **Therapist** | `therapist@demo.com` | `Demo@1234` |
| **Admin** | `admin@serenova.com` | `Admin@1234` |

---

## 🛡️ Security Implementation
Serenova utilizes a localized **SQLite** database (`dev.db`) for rapid development without external dependencies like PostgreSQL or Docker. All sensitive patient data is stringified and encrypted before storage, ensuring that even in a local environment, privacy is maintained.
