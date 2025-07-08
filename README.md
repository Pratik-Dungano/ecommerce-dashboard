# 💄 Parlour Attendance & Management System

A modern, full-stack solution for beauty salons and parlours, featuring real-time attendance tracking, employee management, and task assignment. Built with Next.js, Express, MongoDB, and Socket.IO, it delivers a beautiful, responsive UI and robust backend for seamless daily operations.

---

## 🚀 Features

### 🎨 Modern UI/UX

- Animated gradients, glass morphism, and professional typography
- Responsive, mobile-first design
- Smooth micro-interactions and loading states

### 👥 Employee Management

- Full CRUD: create, read, update, delete employees
- Advanced filtering and search
- Role-based access (Super Admin: manage, Admin: view)
- Rich employee profiles with contact, salary, and emergency info
- Real-time online/offline status

### 🖥️ Public Punch Station

- Kiosk-style, dark-themed interface
- Live clock and date
- Employee selection with search
- Large, interactive punch in/out buttons
- Real-time feedback and smart state management

### ⏰ Attendance Dashboard

- Real-time attendance metrics and rates
- WebSocket-powered instant updates
- Advanced filtering and color-coded records
- Live updates sidebar and quick actions

### 📋 Task Management

- Kanban-style task cards
- Full CRUD for tasks
- Assign tasks to employees
- Priority and status tracking
- Due date management and advanced filters

### 🔐 Authentication & Security

- Modern login page with animated background
- Demo credentials for Super Admin and Admin
- JWT-based authentication with role-based access
- Secure password hashing (bcrypt)

### 🎛️ Navigation & Layout

- Modern navbar with role indicators
- Quick access links
- Fully mobile responsive

### 🔄 Real-time System

- Live punch in/out notifications
- Instant dashboard and task updates
- Real-time employee status
- Connection status monitoring

---

## 🏗️ Technical Architecture

### Frontend

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS, custom CSS animations
- **State:** React hooks, context
- **Real-time:** Socket.IO client
- **Authentication:** JWT (cookie/localStorage)

### Backend

- **Framework:** Express.js (TypeScript)
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, bcrypt
- **Real-time:** Socket.IO server
- **Architecture:** MVC, middleware
- **Security:** Role-based access control

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js >= 18
- npm >= 8 or pnpm
- MongoDB database (local or Atlas)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Parlour\ Project
```

### 2. Install Dependencies

#### Backend

```bash
cd backend-parlour-api
npm install
```

#### Frontend

```bash
cd ../frontend-parlour-dashboard
npm install
```

### 4. Run the Applications

#### Backend (in `backend-parlour-api`)

```bash
npm run dev
```

#### Frontend (in `frontend-parlour-dashboard`)

```bash
npm run dev
```

---

## 📂 Project Structure

```
Parlour Project/
├── backend-parlour-api/      # Express.js API (TypeScript)
├── frontend-parlour-dashboard/ # Next.js 15 frontend (TypeScript)
└── SYSTEM_OVERVIEW.md        # Full feature and design overview
```

---

## 📜 License

This project is licensed for educational and demonstration purposes. For commercial use, please contact the author.

---

## ✨ Credits

- UI/UX Design: Modern CSS, Tailwind, and Inter font
- Backend: Express, MongoDB, Socket.IO
- Frontend: Next.js, React, TailwindCSS

---

Perfect for immediate deployment in any beauty salon or parlour environment! 💄✨
