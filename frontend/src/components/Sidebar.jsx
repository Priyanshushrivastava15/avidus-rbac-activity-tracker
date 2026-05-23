import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, Users, Layers, Activity, CheckSquare, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'Admin') return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Shield size={24} style={{ color: '#a855f7' }} />
        <span className="brand-text">Admin Panel</span>
      </div>

      <ul className="sidebar-menu">
        <li>
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <BarChart2 size={18} />
            <span>Analytics</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>User Management</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/tasks" 
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Layers size={18} />
            <span>Task Monitoring</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/logs" 
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Activity size={18} />
            <span>Activity Logs</span>
          </NavLink>
        </li>
        
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '16px 0' }} />
        
        <li>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <CheckSquare size={18} />
            <span>My Tasks</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
