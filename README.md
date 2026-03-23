<div align="center">

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&pause=1000&color=1F4E79&center=true&vCenter=true&width=600&lines=ClassVerse+%F0%9F%8E%93;Organization+E-Learning+Platform;Learn.+Teach.+Grow." alt="ClassVerse" />

<br/>

```
   ██████╗██╗      █████╗ ███████╗███████╗██╗   ██╗███████╗██████╗ ███████╗███████╗
  ██╔════╝██║     ██╔══██╗██╔════╝██╔════╝██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
  ██║     ██║     ███████║███████╗███████╗██║   ██║█████╗  ██████╔╝███████╗█████╗
  ██║     ██║     ██╔══██║╚════██║╚════██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝
  ╚██████╗███████╗██║  ██║███████║███████║ ╚████╔╝ ███████╗██║  ██║███████║███████╗
   ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
```

<br/>

[![Version](https://img.shields.io/badge/Version-1.0.0-1F4E79?style=for-the-badge&logo=github)](/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Live_Chat-010101?style=for-the-badge&logo=socket.io)](/)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-AI_Summary-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](/)


<br/>

> **ClassVerse** is a production-ready, multi-tenant e-learning platform  
> that brings teachers, students, and admins into one secure, AI-powered digital environment.  
> Each institution gets its own isolated workspace — managed end-to-end by their own Admin.

<br/>

[🚀 Getting Started](#-getting-started) &nbsp;·&nbsp;
[✨ Features](#-features) &nbsp;·&nbsp;
[📦 Modules](#-modules) &nbsp;·&nbsp;
[🏗 Architecture](#-system-architecture) &nbsp;·&nbsp;
[🔌 API Reference](#-api-routes) &nbsp;·&nbsp;
[🗄 Database](#-database-collections)

<br/>

</div>

---

## 📌 Table of Contents

- [System Overview](#-system-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [User Roles](#-user-roles)
- [Multi-Tenant Architecture](#-multi-tenant-architecture)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Default Credentials](#-default-credentials)
- [Environment Variables](#-environment-variables)
- [Modules](#-modules)
- [System Architecture](#-system-architecture)
- [API Routes](#-api-routes)
- [Database Collections](#-database-collections)
- [Security](#-security)
- [Team](#-team)

---

## 🌐 System Overview

ClassVerse is a **multi-tenant, role-based** web application for educational organizations. The platform is owned and operated by a **Super Admin** who registers institutions on the platform and assigns them their own **Admin**. Each institution (college/university) operates in a fully **isolated data environment** — users from one college cannot access data from another.

Inside each institution, teachers create digital classrooms with auto-generated join codes. Students enroll using these codes and get access to study materials, assignments, live chat, and AI-powered document summaries — all within their classroom.

---

## ✨ Features

<br/>

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔐  Multi-Tenant Auth         JWT-based with email domain isolation         │
│  🏛️  Super Admin Panel         Add/remove institutions, monitor all data      │
│  👑  College Admin             Manage teachers & students in own org only     │
│  🏫  Classroom Management      Auto join-code generation, isolated rooms      │
│  📚  Study Materials           PDF / PPT / DOC upload with keyword search     │
│  📝  Assignments               Deadline-enforced submissions + evaluation     │
│  💬  Live Chat                 Real-time WebSocket group chat per classroom   │
│  🤖  AI Summarization          One-click PDF summaries via Hugging Face       │
│  🔍  Instant Search            Client-side material filtering, zero latency   │
│  🛡️  Role-Based Access         Middleware protecting every API endpoint       │
└─────────────────────────────────────────────────────────────────────────────┘
```

<br/>

---

## 🛠 Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                                                                   │
│   React.js           Component-based UI                          │
│   React Router v6    Client-side page routing                    │
│   Axios              HTTP requests to backend API                │
│   Tailwind CSS       Utility-first styling (CDN)                 │
│   Framer Motion      Animations and transitions                  │
│   Socket.io-client   WebSocket live chat connection              │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                         BACKEND                                  │
│                                                                   │
│   Node.js            JavaScript runtime                          │
│   Express.js         REST API framework                          │
│   Socket.io          Real-time WebSocket server                  │
│   Multer             Multipart file upload handling              │
│   jsonwebtoken       JWT generation and verification             │
│   bcryptjs           Password hashing with salt                  │
│   Axios              Hugging Face API calls                      │
│   pdf-parse          PDF text extraction for AI                  │
│   mammoth            DOC/DOCX text extraction                    │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                         DATABASE                                 │
│                                                                   │
│   MongoDB Atlas      Cloud NoSQL database                        │
│   Mongoose           ODM for schema definition and queries       │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                      EXTERNAL SERVICES                           │
│                                                                   │
│   Hugging Face       AI Inference API (free tier)                │
│   bart-large-cnn     Summarization model by Facebook             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles

| Role | Scope | Capabilities |
|------|-------|-------------|
| 🔴 **SuperAdmin** | Platform-wide | Adds/removes organizations, creates Admin accounts, monitors all users and classrooms across every institution |
| 🟠 **Admin** | Institution-wide | Views and removes teachers/students in their own college, monitors institution activity |
| 🟢 **Teacher** | Classroom-wide | Creates classrooms, uploads materials, creates assignments, evaluates submissions, chats |
| 🔵 **Student** | Enrolled classrooms | Joins classrooms, browses materials, submits assignments, uses AI tools, chats |

> **SuperAdmin is created via `seed.js` only.**  
> **College Admins are created exclusively by the SuperAdmin from the Super Admin Panel.**  
> **No one can self-register as Admin or SuperAdmin.**

---

## 🏛 Multi-Tenant Architecture

ClassVerse uses **email domain-based organization isolation**. When a SuperAdmin registers an institution, they specify its **email domain** (e.g. `viit.ac.in`). Teachers and students who register with that email domain are automatically linked to that institution.

```
SuperAdmin  ──────────────────────────────────────────────┐
                                                           │ creates
                                            ┌──────────────▼──────────────┐
                                            │  Organization: VIIT          │
                                            │  Domain: @viit.ac.in         │
                                            │  Admin: principal@viit.ac.in │
                                            └──────┬──────────────┬────────┘
                                                   │              │
                                      ┌────────────▼──┐    ┌──────▼────────────┐
                                      │  Teacher       │    │  Student           │
                                      │  @viit.ac.in   │    │  @viit.ac.in       │
                                      └───────────────┘    └──────────────────┘

                                            ⬇ isolated from ⬇

                                            ┌──────────────────────────────┐
                                            │  Organization: MIT Pune       │
                                            │  Domain: @mitpune.edu.in      │
                                            └──────────────────────────────┘
```

**Key isolation rules:**
- Teachers from VIIT can only see VIIT classrooms and materials
- Students from VIIT can only join VIIT classrooms
- VIIT Admin can only manage VIIT users
- Only SuperAdmin can see across all organizations

---

## 📁 Folder Structure

```
classverse/
│
├── 📂 client/                           React Frontend
│   └── src/
│       ├── 📂 components/
│       │   ├── Navbar.jsx               Top navigation bar
│       │   ├── Sidebar.jsx              Side navigation
│       │   └── ProtectedRoute.jsx       Auth guard for routes
│       │
│       ├── 📂 context/
│       │   └── AuthContext.jsx          Global auth state + token management
│       │
│       ├── 📂 pages/
│       │   ├── Login.jsx                Sign in page
│       │   ├── Register.jsx             Registration with role selection
│       │   ├── SuperAdminDashboard.jsx  Platform-wide management
│       │   ├── AdminDashboard.jsx       Institution management
│       │   ├── TeacherDashboard.jsx     Classroom management
│       │   ├── StudentDashboard.jsx     Enrolled classrooms view
│       │   ├── ClassroomView.jsx        Tab view: Materials, Assignments, Chat
│       │   ├── StudyMaterials.jsx       Upload, browse, search, AI summarize
│       │   ├── Assignments.jsx          Create, submit, evaluate
│       │   └── Chat.jsx                 Real-time classroom chat
│       │
│       └── 📂 services/
│           └── api.js                   Axios instance with base URL + auth headers
│
│
├── 📂 server/                           Node.js Backend
│   ├── 📂 config/
│   │   └── db.js                        MongoDB Atlas connection
│   │
│   ├── 📂 controllers/
│   │   ├── authController.js            Register, login, getMe
│   │   ├── adminController.js           Stats, users, org CRUD
│   │   ├── classroomController.js       Create, join, manage members
│   │   ├── materialController.js        Upload, fetch, delete
│   │   ├── assignmentController.js      Create, submit, evaluate
│   │   ├── chatController.js            Message history
│   │   └── summarizeController.js       PDF extraction + HF API
│   │
│   ├── 📂 middleware/
│   │   └── authMiddleware.js            JWT verification middleware
│   │
│   ├── 📂 models/
│   │   ├── User.js                      name, email, password, role, orgId
│   │   ├── Organization.js              name, emailDomain, adminId
│   │   ├── Classroom.js                 name, subject, joinCode, members
│   │   ├── Material.js                  title, fileType, filePath, classroomId
│   │   ├── Assignment.js                title, description, deadline
│   │   ├── Submission.js                studentId, assignmentId, filePathOrText
│   │   └── ChatMessage.js              classroomId, senderId, senderName, text
│   │
│   ├── 📂 routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── classroomRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── chatRoutes.js
│   │   └── summarizeRoutes.js
│   │
│   ├── 📂 socket/
│   │   └── socketHandler.js             Socket.io join/leave/message events
│   │
│   ├── 📂 uploads/                      Uploaded files stored here (gitignored)
│   │
│   ├── seed.js                          Creates SuperAdmin + demo org + test users
│   ├── server.js                        App entry point
│   └── .env                             Environment variables (never commit this)
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | >= 18.0.0 | [nodejs.org](https://nodejs.org) |
| npm | >= 9.0.0 | Included with Node.js |
| MongoDB | Atlas (free) | [mongodb.com/atlas](https://mongodb.com/atlas) |
| Hugging Face | Free account | [huggingface.co](https://huggingface.co) |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/ClassVerse.git
cd ClassVerse
```

---

### Step 2 — Setup Backend

```bash
cd server
npm install
```

---

### Step 3 — Configure Environment Variables

```bash
# Create .env file in the server/ directory
```

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/classverse
JWT_SECRET=your_strong_secret_key_here
CLIENT_URL=http://localhost:5173
HF_TOKEN=hf_your_huggingface_token_here
```

> Get your `HF_TOKEN` from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)  
> Get your `MONGO_URI` from your MongoDB Atlas cluster → Connect → Drivers

---

### Step 4 — Seed the Database

```bash
node seed.js
```

This command:
- Creates the **SuperAdmin** account
- Creates a **demo organization** (`classverse.com`)
- Creates demo **Admin**, **Teacher**, and **Student** accounts

---

### Step 5 — Start Backend Server

```bash
npm run dev
# Server starts at http://localhost:5000
```

---

### Step 6 — Setup Frontend

```bash
cd ../client
npm install
npm run dev
# App opens at http://localhost:5173
```

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | Backend server port (default: 5000) |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key used for signing JWT tokens |
| `CLIENT_URL` | ✅ | Frontend URL — used for CORS configuration |
| `HF_TOKEN` | ✅ | Hugging Face API token for AI summarization |

---

## 📦 Modules

---

### 🔐 Module 1 — User Management

Every user registers with an **institutional email address** and selects their role. The system automatically detects which organization the user belongs to based on their email domain. A unique security token is generated on login and attached to every subsequent request to verify identity and role.

**Key behaviors:**
- Passwords are hashed before storage — never stored in plain text
- Token expires after 7 days
- Protected routes reject requests without a valid token
- Role-based dashboards — each role sees a completely different interface

---

### 🏛 Module 2 — Multi-Tenant Organization Management

The SuperAdmin is the sole operator of the platform. When an institution purchases ClassVerse, the SuperAdmin registers them by:

1. Entering the **college name** and **email domain** (e.g. `viit.ac.in`)
2. Creating an **Admin account** with credentials for that institution
3. The institution's Admin shares login credentials with their teachers and students

If an institution's contract ends, the SuperAdmin removes the organization — this deletes all users, classrooms, and data associated with that institution instantly.

---

### 🏫 Module 3 — Classroom Management

Teachers create digital classrooms by entering a name and subject. The system auto-generates a **unique 6-character join code** for each classroom. Students enter this code on their dashboard to enroll.

Each classroom is a completely isolated space containing:
- Study Materials tab
- Assignments tab
- Live Chat tab

Teachers can remove students. Students can unenroll.

---

### 📚 Module 4 — Study Material Management

Teachers upload files (PDF, PPT, PPTX, DOC, DOCX) using the upload form inside the classroom. Files are saved to the server's `uploads/` directory and metadata is recorded in MongoDB.

Students see all materials with a **real-time keyword search** bar that filters results instantly on the client side — no extra server requests needed.

Each file displays a type badge (PDF / PPT / DOC), upload date, and View / Download buttons.

---

### 📝 Module 5 — Assignment Management

Teachers create assignments with a **title, description, and exact deadline** (date + time). The deadline is enforced at both the server level and the interface level:

- The submit button disappears after the deadline passes
- The server rejects submissions if the current time exceeds the deadline

Students can submit PDF, DOC, or PPT files. They can also delete their submission and resubmit before the deadline passes. Teachers see a list of all submissions with student name, email, timestamp, and a link to view the file.

---

### 💬 Module 6 — Live Classroom Chat

Every classroom has a dedicated **real-time group chat** powered by Socket.io WebSockets. Messages are instantly delivered to all connected members without any page reload.

On joining the chat tab, the last 100 messages are loaded from MongoDB. Messages display the sender's name, role badge (Teacher / Student), and timestamp.

Each classroom is a separate Socket.io room — messages from one classroom never appear in another.

---

### 🤖 Module 7 — AI-Based Study Material Summarization

Students can click **AI Summarize** on any uploaded PDF, DOC, or DOCX material. The system:

1. Reads the file from the server
2. Extracts readable text (using `pdf-parse` or `mammoth`)
3. Sends the text to the **Hugging Face Inference API**
4. The `facebook/bart-large-cnn` model generates a concise summary
5. The summary is returned to the student

The Hugging Face API key is stored server-side and never exposed to the client. The service is free tier — no payment required.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│                      React.js Web App                                │
│                                                                       │
│   Login    Register    Dashboards    Classroom    Chat               │
│   Materials    Assignments    AI Summary Button                       │
└─────────────────────┬──────────────────────┬────────────────────────┘
                      │  HTTP REST (Axios)    │  WebSocket (Socket.io)
                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                               │
│                   Node.js + Express Backend                          │
│                                                                       │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │ Auth Service  │  │  REST API    │  │   Socket.io Server     │   │
│  │ JWT + bcrypt  │  │  Routes +    │  │   Real-time Chat       │   │
│  └───────────────┘  │  Controllers │  └────────────────────────┘   │
│                      └──────────────┘                                │
│  ┌───────────────┐  ┌──────────────┐                                │
│  │ Multer Upload │  │ AI Summary   │──────► Hugging Face API        │
│  │ File Handler  │  │ Controller   │        facebook/bart-large-cnn  │
│  └───────────────┘  └──────────────┘                                │
│                                                                       │
│                     Role Middleware (JWT Guard)                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  Mongoose ODM
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│                       MongoDB Atlas                                  │
│                                                                       │
│   users · organizations · classrooms · materials                     │
│   assignments · submissions · chatmessages                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Routes

### 🔐 Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register as Teacher or Student |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT token |
| `GET` | `/api/auth/me` | ✅ | Get current logged-in user |

### 🏛 Super Admin
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/stats` | All Admin | Platform or org stats |
| `GET` | `/api/admin/users` | All Admin | Get users (scoped by role) |
| `DELETE` | `/api/admin/users/:id` | All Admin | Remove a user |
| `GET` | `/api/admin/organizations` | SuperAdmin | List all organizations |
| `POST` | `/api/admin/organizations` | SuperAdmin | Add new organization + admin |
| `DELETE` | `/api/admin/organizations/:id` | SuperAdmin | Remove org and all its data |

### 🏫 Classroom
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/classroom/create` | Teacher | Create classroom |
| `POST` | `/api/classroom/join` | Student | Join via join code |
| `GET` | `/api/classroom/my` | All | Get user's classrooms |
| `GET` | `/api/classroom/:id` | All | Get classroom details |
| `DELETE` | `/api/classroom/:id/remove/:studentId` | Teacher | Remove student |

### 📚 Materials
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/materials/upload` | Teacher | Upload file to classroom |
| `GET` | `/api/materials/:classroomId` | All | Get classroom materials |
| `DELETE` | `/api/materials/:id` | Teacher | Delete material |

### 📝 Assignments
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/assignments/create` | Teacher | Create assignment with deadline |
| `GET` | `/api/assignments/:classroomId` | All | List classroom assignments |
| `POST` | `/api/assignments/submit` | Student | Submit assignment file |
| `GET` | `/api/assignments/mystatus/:id` | Student | Check submission status |
| `DELETE` | `/api/assignments/submission/:id` | Student | Delete submission |
| `GET` | `/api/assignments/submissions/:id` | Teacher | View all submissions |

### 💬 Chat
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/chat/:classroomId` | ✅ | Load last 100 messages |

**Socket.io Events:**
| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `join-room` | `classroomId` |
| Client → Server | `send-message` | `{ classroomId, senderId, senderName, senderRole, text }` |
| Client → Server | `leave-room` | `classroomId` |
| Server → Client | `receive-message` | `{ _id, senderName, senderRole, text, createdAt }` |

### 🤖 AI
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/summarize` | Student | Summarize a PDF/DOC material |

---

## 🗄 Database Collections

| Collection | Key Fields | Description |
|------------|-----------|-------------|
| `users` | `name, email, password, role, organizationId` | All platform users |
| `organizations` | `name, emailDomain, adminId` | Registered institutions |
| `classrooms` | `name, subject, joinCode, teacherId, members[]` | Digital classrooms |
| `materials` | `title, fileType, filePath, classroomId, uploadedBy` | Uploaded files metadata |
| `assignments` | `title, description, deadline, classroomId, createdBy` | Assignments |
| `submissions` | `assignmentId, studentId, filePathOrText, submittedAt` | Student submissions |
| `chatmessages` | `classroomId, senderId, senderName, senderRole, text` | Chat history |

### Collection Relationships

```
organizations ──────────────────────────────────────────────────┐
      │                                                           │
      │ (organizationId)                                          │
      ▼                                                           │
   users ─────────────────────────────────────────────────────────┘
      │                     │                      │
 (teacherId)          (members[])            (uploadedBy)
      │                     │                      │
      ▼                     ▼                      ▼
 classrooms ─────────► classrooms ◄──────── materials
      │
 (classroomId)
      │
      ├──► assignments ──► submissions ◄── users (studentId)
      │
      └──► chatmessages ◄── users (senderId)
```

---

## 🔒 Security

| Practice | Implementation |
|----------|---------------|
| Password storage | bcrypt with 10 salt rounds — plaintext never stored |
| Authentication | JWT tokens — expire after 7 days |
| Authorization | Role middleware on every protected endpoint |
| API key safety | Hugging Face token stored server-side only |
| Data isolation | All queries scoped by `organizationId` |
| File validation | Multer restricts accepted MIME types |
| Self-deletion | Admin/SuperAdmin cannot delete their own account |
| SuperAdmin creation | Only via `seed.js` — not accessible from UI |

---

## 👨‍💻 Team

| Name | Role |
|------|------|
| Mayur Mahindrakar | Project Manager |
| Suraj Khaire | Frontend Developer |
| Harshal Laware | Frontend Developer |
| Nikhil Gaikwad | Frontend Developer |
| Suyash Kakade | Backend Developer |
| Prathmesh Jagdale | Backend Developer |
| Rohan Gaikwad | Tester |
| Pranav Khonde | Documentation Head |

---

<div align="center">

<br/>

```
Built with ❤️ for Agile and DevOps Lab
Submitted to: Diwate Sir · ClassVerse Team · 2026
```

[![GitHub](https://img.shields.io/badge/GitHub-ClassVerse-1F4E79?style=for-the-badge&logo=github)](https://github.com/mayurmahi/devops-college-project-2)

<br/>

</div>
