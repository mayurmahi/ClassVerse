<div align="center">

# 🎓 ClassVerse
### Organization-Based E-Learning Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.0.0-61dafb)
![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248)

A full-stack e-learning platform where organizations can manage 
teachers, students, classrooms, study materials, assignments, 
real-time chat, and AI-powered document summarization.

</div>

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Default Credentials](#default-credentials)
- [Environment Variables](#environment-variables)
- [Modules](#modules)
- [API Routes](#api-routes)

---

## 🌐 Overview

ClassVerse is a web-based e-learning platform built for organizations. 
It operates under three distinct roles — **Admin**, **Teacher**, and 
**Student** — each with clearly defined permissions. Teachers can create 
classrooms, upload study materials, and manage assignments. Students can 
join classrooms, submit assignments, and use AI to summarize documents. 
Admins manage the entire platform.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT-based login and registration with role selection |
| 🏫 Classroom Management | Create classrooms with auto-generated join codes |
| 📚 Study Materials | Upload PDF/PPT files with keyword search |
| 📝 Assignments | Create assignments with deadlines and file submissions |
| 💬 Live Chat | Real-time classroom group chat using Socket.io |
| 🤖 AI Summarization | Auto-summarize PDF documents using Hugging Face |
| 👑 Admin Dashboard | Manage users and monitor platform activity |

---

## 🛠 Tech Stack

**Frontend:**
- React.js (JavaScript)
- React Router v6
- Axios
- Tailwind CSS
- Socket.io-client

**Backend:**
- Node.js
- Express.js
- Socket.io
- Multer (file uploads)
- JWT + bcrypt.js

**Database:**
- MongoDB + Mongoose

**AI:**
- Hugging Face Inference API (facebook/bart-large-cnn)

---

## 📁 Folder Structure
```
classverse/
├── client/                        # React Frontend
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── TeacherDashboard.jsx
│       │   ├── StudentDashboard.jsx
│       │   ├── ClassroomView.jsx
│       │   ├── StudyMaterials.jsx
│       │   ├── Assignments.jsx
│       │   └── Chat.jsx
│       └── services/
│           └── api.js
│
├── server/                        # Node.js Backend
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── classroomController.js
│   │   ├── materialController.js
│   │   ├── assignmentController.js
│   │   ├── adminController.js
│   │   └── summarizeController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Classroom.js
│   │   ├── Material.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   └── ChatMessage.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── classroomRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── chatRoutes.js
│   │   └── summarizeRoutes.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── seed.js
│   ├── server.js
│   └── .env
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account (free tier)
- Hugging Face account (free tier)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/ClassVerse.git
cd ClassVerse
```

**2. Setup Backend**
```bash
cd server
npm install
```

**3. Setup Environment Variables**
```bash
cp .env.example .env
# Fill in your values in .env file
```

**4. Seed Default Users**
```bash
node seed.js
```

**5. Start Backend**
```bash
npm run dev
```

**6. Setup Frontend**
```bash
cd ../client
npm install
npm run dev
```

**7. Open Browser**
```
http://localhost:5173
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
HF_TOKEN=your_huggingface_api_token
```

---

## 📦 Modules

### 🔐 User Management
Every user registers with an institutional email and selects a role. 
After login, a JWT token is generated for session management. 
Each role gets a completely different dashboard.

### 🏫 Classroom Management
Teachers create classrooms with auto-generated 6-character join codes. 
Students join using the code. Each classroom is an isolated environment.

### 📚 Study Material Management
Teachers upload PDF or PPT files. Students browse and search materials 
using keyword search (client-side, instant filtering).

### 📝 Assignment Management
Teachers create assignments with deadlines. Students submit files 
(PDF/DOC/PPT) before the deadline. Submission is automatically locked 
after deadline. Teachers can view all submissions.

### 💬 Live Classroom Chat
Real-time group chat inside each classroom using Socket.io WebSockets. 
Messages are saved to the database and loaded on page open.

### 🤖 AI Summarization
Students can summarize any uploaded PDF document with one click. 
Uses Hugging Face Inference API (facebook/bart-large-cnn) — free tier.

### 👑 Admin Dashboard
Admin monitors all users and classrooms. Can remove any teacher or 
student from the platform.

---

## 🔌 API Routes
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/admin/stats
GET    /api/admin/users
DELETE /api/admin/users/:id

POST   /api/classroom/create
POST   /api/classroom/join
GET    /api/classroom/my
GET    /api/classroom/:id

POST   /api/materials/upload
GET    /api/materials/:classroomId

POST   /api/assignments/create
GET    /api/assignments/:classroomId
POST   /api/assignments/submit
GET    /api/assignments/submissions/:assignmentId
GET    /api/assignments/mystatus/:assignmentId
DELETE /api/assignments/submission/:submissionId

GET    /api/chat/:classroomId

POST   /api/summarize
```

---

<div align="center">
Made with ❤️ for Agile and DevOps Lab — ClassVerse Team
</div>
