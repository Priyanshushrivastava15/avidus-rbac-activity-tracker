import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages imports
import Login from './pages/Login';
import Register from './pages/Register';
import UserTasks from './pages/UserTasks';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import TaskMonitoring from './pages/TaskMonitoring';
import ActivityLogs from './pages/ActivityLogs';

// Route guard import
import ProtectedRoute from './components/ProtectedRoute';

// Smart Home redirect helper
const HomeRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Standard User Workspace */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserTasks />
          </ProtectedRoute>
        } 
      />

      {/* Protected Admin Console Hub */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute adminOnly={true}>
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/tasks" 
        element={
          <ProtectedRoute adminOnly={true}>
            <TaskMonitoring />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/logs" 
        element={
          <ProtectedRoute adminOnly={true}>
            <ActivityLogs />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all smart redirector */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
