import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Activity, ShieldAlert, Calendar, User, Search, RefreshCw, Terminal } from 'lucide-react';

const ActivityLogs = () => {
  const { request } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [actionCategory, setActionCategory] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await request('/logs');
      setLogs(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch auditable logs directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadgeColor = (action) => {
    if (action.includes('Success')) return 'active';
    if (action.includes('Failed')) return 'inactive';
    if (action.includes('Status') || action.includes('Update')) return 'pending';
    if (action.includes('Deletion') || action.includes('Deleted')) return 'inactive';
    return 'user';
  };

  const filteredLogs = logs.filter(log => {
    // 1. Category filter
    if (actionCategory !== 'All') {
      if (actionCategory === 'Login' && !log.action.includes('Login')) return false;
      if (actionCategory === 'Tasks' && !log.action.includes('Task')) return false;
      if (actionCategory === 'Admin' && (!log.action.includes('User') && !log.action.includes('Status') && !log.action.includes('Delete'))) return false;
    }

    // 2. Search query filter
    const query = searchTerm.toLowerCase();
    const matchesAction = log.action.toLowerCase().includes(query);
    const matchesDetails = log.details.toLowerCase().includes(query);
    const matchesIp = (log.ipAddress || '').toLowerCase().includes(query);
    
    let matchesUser = false;
    if (log.user) {
      matchesUser = 
        log.user.name.toLowerCase().includes(query) || 
        log.user.email.toLowerCase().includes(query);
    } else if (log.email) {
      matchesUser = log.email.toLowerCase().includes(query);
    }

    return matchesAction || matchesDetails || matchesIp || matchesUser;
  });

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Navbar title="System Audit Logs Console" />

        <main className="main-content animate-fade-in">
          {error && (
            <div className="alert error">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="glass-panel table-card" style={{ paddingBottom: '16px' }}>
            <div className="table-header-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Security Activity Logs ({logs.length})</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Auditing system operations. Track user registration, logins, task CRUD changes, and profile status updates.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {/* Search Bar */}
                <div className="filter-input-wrapper" style={{ width: '250px' }}>
                  <Search className="filter-icon" size={16} />
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Search action, details, user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter Dropdown */}
                <select
                  className="filter-select"
                  value={actionCategory}
                  onChange={(e) => setActionCategory(e.target.value)}
                >
                  <option value="All">All Operations</option>
                  <option value="Login">Logins only</option>
                  <option value="Tasks">Tasks operations</option>
                  <option value="Admin">User Administration</option>
                </select>

                {/* Refresh Trigger */}
                <button 
                  onClick={fetchLogs} 
                  className="glass-btn btn-outline" 
                  style={{ width: '40px', height: '40px', padding: 0 }}
                  title="Refresh logs"
                >
                  <RefreshCw size={14} />
                </button>
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
            ) : filteredLogs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Terminal size={28} />
                </div>
                <h4 className="empty-title">No audit logs found</h4>
                <p style={{ fontSize: '13px' }}>Try expanding your query parameters.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '180px' }}>Timestamp</th>
                      <th>Action</th>
                      <th>Event Details</th>
                      <th>Operator</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log._id}>
                        <td style={{ color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={12} />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{log.details}</td>
                        <td>
                          {log.user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={12} style={{ color: '#c084fc' }} />
                              <span>{log.user.name}</span>
                            </div>
                          ) : log.email ? (
                            <span style={{ color: 'var(--text-muted)' }}>
                              {log.email} <span style={{ fontSize: '10px' }}>(Attempt)</span>
                            </span>
                          ) : (
                            <em style={{ color: 'var(--text-dark)' }}>System Automated</em>
                          )}
                        </td>
                        <td>
                          <code style={{ background: 'rgba(255,255,255,0.02)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '11px', color: '#06b6d4' }}>
                            {log.ipAddress === '::1' ? '127.0.0.1' : log.ipAddress}
                          </code>
                        </td>
                      </tr>
                    ))}
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

export default ActivityLogs;
