# 🛡️ Avidus Interactive RBAC & User Activity Tracking System

A production-grade, full-stack application incorporating robust **Role-Based Access Control (RBAC)** rules and a granular **User Activity Tracking Ledger**. 

Built with a scalable **Node.js + Express** API connected to **MongoDB Atlas**, paired with a **React (Vite)** console powered by smooth CSS glassmorphism, responsive dashboard grids, and custom interactive SVG data visualizations.

---

## 🚀 Key Features

### 🔐 Role-Based Access Control (RBAC) & Security
*   **Dynamic Authentication**: JWT-based session tokens stored and refreshed securely in LocalStorage.
*   **Granular System Roles**:
    *   **Administrator**: Complete visibility of all registered accounts, global workspace task directory (with deletion capabilities), and system-wide auditable activity logs. Can suspend/activate standard accounts.
    *   **Standard User**: Workspace workspace to create, view, edit, and delete *only their own* tasks. 
*   **Route Protections**: Strict backend route guards (`protect` and `adminOnly` middlewares) that validate tokens, inspect role parameters, and automatically terminate active sessions if an administrator deactivates the user's account.

### 📊 Administrative Console & Analytics
*   **Premium Glassmorphic UI**: Vibrant, responsive dark-mode grids matching modern premium dashboards.
*   **Workspace Metrics & Analytics Grid**: Displays real-time calculations for:
    *   *Total Accounts* (broken down by Administrators vs. Standard Users)
    *   *Global Workspace Tasks*
    *   *Completed Tasks*
    *   *Pending Review Tasks*
*   **Custom Data Visualizations**:
    *   *Interactive SVG Bar Graph*: Renders user distributions categorized by system roles and active states.
    *   *Dynamic SVG Progress Ring*: Calculates and displays the global workspace task completion percentage in real time.
*   **Security Event Auditing**: Preview ledger on the main dashboard showing recent system-wide actions.

### ⚙️ Workspace Administration Directories
*   **User Directory Directory**: Admins can search for accounts, toggle active states (with self-deactivation protection), and delete users (clearing associated database records).
*   **Task Monitoring Directory**: Admins can audit every active workspace task and delete items to keep the system clean.
*   **Granular Activity Log Audit**: Ledger featuring action filters (`Login Success`, `Login Failed`, `Task Creation`, etc.) capturing user emails, timestamps, and IP addresses.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), React Router DOM (v6), Lucide Icons, Custom CSS variables, and glassmorphic designs.
*   **Backend**: Node.js, Express, MongoDB (Mongoose ODM), JSON Web Tokens (JWT), Bcrypt.js, Cors, Morgan, Dotenv.
*   **Hosting**: Vercel (Frontend), Render (Backend), MongoDB Atlas (Cloud Database).

---

## 📂 Project Structure

```text
avidus-rbac-tracker/
├── backend/
│   ├── config/             # DB Connection Config
│   ├── controllers/        # Express Controllers (Auth, Task, User, Log)
│   ├── middleware/         # Auth & Role Guards (protect, adminOnly)
│   ├── models/             # Mongoose Schemas (User, Task, ActivityLog)
│   ├── routes/             # Express API Endpoints
│   ├── utils/              # Activity logger utility
│   ├── .env.example        # Environment variable guides
│   └── server.js           # API Entry Point
├── frontend/
│   ├── public/             # SVGs and static assets
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, Sidebar, RouteGuard)
│   │   ├── context/        # Global Auth & Axios-style wrapper Context
│   │   ├── pages/          # Pages (Dashboard, Auth, Admins Views)
│   │   ├── App.jsx         # Client Shell & Route configuration
│   │   ├── index.css       # Premium Global Stylesheet
│   │   └── main.jsx        # Client Entry Point
└── package.json            # Workspace orchestration
```

---

## ⚙️ Environment Configuration

To run the project, configure environment files in your subdirectories:

### 1. Backend (`backend/.env`)
Create a `.env` file inside the `backend` folder and add:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 2. Frontend (`frontend/.env`)
For production, create environment settings or set environment variables in Vercel:
```env
VITE_API_URL=your_deployed_backend_api_url/api
```

---

## 💻 Local Quickstart

Orchestrate the entire application from the root directory with ease:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Priyanshushrivastava15/avidus-rbac-activity-tracker.git
    cd avidus-rbac-activity-tracker
    ```
2.  **Install All Dependencies** (Root, Backend, and Frontend):
    ```bash
    npm run install-all
    ```
3.  **Run Development Server** (Launches API on port 5000 and Vite client on port 5173 simultaneously):
    ```bash
    npm run dev
    ```

---

## 🚀 Cloud Deployment Configuration

### Render (Backend Deployment)
*   **Root Directory**: `backend`
*   **Runtime**: `Node`
*   **Build Command**: `npm install`
*   **Start Command**: `npm start`
*   **Env Variables**: `PORT=5000`, `MONGO_URI=<your_atlas_connection_string>`, `JWT_SECRET=<your_secret>`

### Vercel (Frontend Deployment)
*   **Root Directory**: `frontend`
*   **Framework Preset**: `Vite`
*   **Env Variables**: Add `VITE_API_URL` matching your Render app URL + `/api` (e.g., `https://avidus-rbac-backend.onrender.com/api`).
