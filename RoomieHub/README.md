# 🏠 RoomieHub – Smart Roommate Management System

RoomieHub is a modern, beginner-friendly, full-stack web application built to streamline shared apartment and living activities. It enables roommates to easily split expenses, track payments and debts, distribute household chores, manage shopping lists, post announcements, and view monthly spending analytics.

---

## 🎨 Color Theme
- **Primary**: Purple (`#7654D6`)
- **Secondary**: Lavender (`#EDE7FF`)
- **Background**: White (`#FFFFFF`)
- **Light Background**: (`#F7F6FC`)
- **Text**: Dark Grey (`#29263A`)

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js (Vite)
  - React Router DOM
  - HTML5 & Vanilla CSS3 (Custom modular CSS files, No Tailwind/Bootstrap)
  - JavaScript Fetch API (Strictly No Axios)
- **Backend**:
  - Node.js & Express.js
  - RESTful API Architecture
  - JWT Authentication (JSON Web Tokens)
  - bcrypt.js for password encryption
  - CORS enabled for seamless communication
- **Database**:
  - MongoDB Atlas / Local MongoDB via Mongoose

---

## 📂 Project Structure

```
RoomieHub/
├── frontend/                  # React.js client application
│   ├── public/                # Static public assets (favicon.svg)
│   ├── src/
│   │   ├── assets/            # App branding (logo.svg, images)
│   │   ├── components/        # Reusable UI components (Navbar, Sidebar, etc.)
│   │   ├── pages/             # All 14 application pages
│   │   ├── css/               # Individual Vanilla CSS styling per page
│   │   ├── context/           # AuthContext (state management)
│   │   ├── services/          # Fetch API service wrapper (api.js)
│   │   ├── App.jsx            # Main route definition
│   │   └── main.jsx           # React DOM root entry
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Node.js & Express backend API
│   ├── config/                # MongoDB Mongoose database connection
│   ├── models/                # 7 Mongoose collection schemas
│   ├── controllers/           # Business logic & CRUD handlers
│   ├── routes/                # REST API route endpoints
│   ├── middleware/            # JWT authentication middleware
│   ├── server.js              # Express app entry point
│   ├── package.json
│   └── .env                   # Environment variables
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB instance

---

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file (one has been provided with sensible defaults):
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/roomiehub?retryWrites=true&w=majority
   JWT_SECRET=supersecret_roomiehub_jwt_key_2026
   ```
   *(For offline development, you can use `mongodb://127.0.0.1:27017/roomiehub`)*
4. Start the backend server:
   ```bash
   npm start
   ```
   Server will run on: **http://localhost:5000**

---

### 3. Frontend Setup
1. Open a second terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will run on: **http://localhost:5173**

---

## 🌟 Key Features

1. **Authentication & Room Management**:
   - Register and Login with secure password hashing and JWT authorization.
   - Create a shared room and receive a unique 6-character room code.
   - Roommates can join the shared room instantly using the room code.
2. **Expense Splitting**:
   - Log shared expenses with category and title.
   - Automatically splits amounts evenly among room members.
   - Edit or delete logged expenses anytime.
3. **Payment Tracking**:
   - Real-time breakdown of amounts owed and amounts due.
   - One-click "Mark as Paid" settlement tracker.
4. **Chore Management**:
   - Assign cleaning, dishes, and household duties to specific roommates.
   - Set due dates and track pending vs. completed status.
5. **Grocery List**:
   - Shared grocery checklist with item quantities and categories.
   - Interactive checkboxes to mark items as purchased.
6. **Announcements**:
   - Post room-wide notices, rules, and event reminders.
   - Creator-based authorization for editing and deleting notices.
7. **Reports & Analytics**:
   - Monthly expenditure totals and category-wise spending bars.
   - Roommate spending distribution charts.
