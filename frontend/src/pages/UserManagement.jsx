import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Trash2, ShieldAlert, UserX, UserCheck, Shield, HelpCircle, Search } from 'lucide-react';

const UserManagement = () => {
  const { request, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await request('/users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to retrieve workspace users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    
    try {
      const data = await request(`/users/${user._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });

      setUsers(users.map(u => u._id === user._id ? { ...u, status: nextStatus } : u));
      setSuccessMsg(data.message || 'User status successfully modified');
      setError('');

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to toggle user status');
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      const data = await request(`/users/${user._id}`, {
        method: 'DELETE'
      });

      setUsers(users.filter(u => u._id !== user._id));
      setSuccessMsg(data.message || 'User account and tasks successfully deleted');
      setError('');

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete user account');
    }
  };

  // Filter criteria
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Navbar title="Workspace User Directory" />

        <main className="main-content animate-fade-in">
          {error && (
            <div className="alert error">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert success">
              <UserCheck size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="glass-panel table-card">
            <div className="table-header-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Registered Users ({users.length})</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Manage access permissions, toggle Active/Inactive statuses, and delete user profiles.
                </p>
              </div>

              {/* Search input */}
              <div className="filter-input-wrapper" style={{ flex: 'none', width: '280px' }}>
                <Search className="filter-icon" size={16} />
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Search name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div style={{
                  width: '36px', height: '36px',
                  border: '3px solid rgba(255,255,255,0.05)',
                  borderTop: '3px solid #a855f7',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <UserX size={28} />
                </div>
                <h4 className="empty-title">No users match your criteria</h4>
                <p style={{ fontSize: '13px' }}>Try adjusting your search terms or verify registration status.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>User Info</th>
                      <th>Email Address</th>
                      <th>System Role</th>
                      <th>Active Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => {
                      const isSelf = currentUser && user._id === currentUser._id;
                      
                      return (
                        <tr key={user._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600 }}>{user.name}</span>
                                {isSelf && (
                                  <span style={{ fontSize: '9px', color: '#a855f7', fontWeight: 600 }}>
                                    (Active Self Session)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                          <td>
                            <span className={`badge ${user.role === 'Admin' ? 'admin' : 'user'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.status === 'Active' ? 'active' : 'inactive'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              {/* Toggle Active Status button */}
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`action-btn ${user.status === 'Active' ? 'btn-delete' : 'btn-complete'}`}
                                disabled={isSelf}
                                title={isSelf ? 'Cannot disable your own administrator account' : user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                                style={{ opacity: isSelf ? 0.3 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                              >
                                {user.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
                              </button>

                              {/* Delete button */}
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="action-btn btn-delete"
                                disabled={isSelf}
                                title={isSelf ? 'Cannot delete your own administrator account' : 'Delete Account'}
                                style={{ opacity: isSelf ? 0.3 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
