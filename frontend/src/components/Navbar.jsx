import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, CheckSquare } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CheckSquare size={22} className="pulse-neon" style={{ color: '#6366f1' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h2>
      </div>

      <div className="navbar-user-info">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.name}</span>
          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {user.role === 'Admin' ? (
              <>
                <Shield size={10} style={{ color: '#a855f7' }} />
                <span className="badge admin" style={{ fontSize: '8px', padding: '1px 4px' }}>Admin</span>
              </>
            ) : (
              <>
                <User size={10} style={{ color: '#06b6d4' }} />
                <span className="badge user" style={{ fontSize: '8px', padding: '1px 4px' }}>User</span>
              </>
            )}
          </span>
        </div>

        <div className="user-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <button 
          onClick={logout}
          className="action-btn btn-delete" 
          title="Log Out"
          style={{ marginLeft: '8px', width: '36px', height: '36px', borderRadius: '50%' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
