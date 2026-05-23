import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Users, FolderKanban, CheckCircle2, Clock, Shield, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { request } = useAuth();
  
  // States
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      // Parallel requests
      const [usersData, tasksData, logsData] = await Promise.all([
        request('/users'),
        request('/tasks'),
        request('/logs')
      ]);

      setUsers(usersData);
      setTasks(tasksData);
      setLogs(logsData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch administration metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Compute metrics
  const totalUsers = users.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Custom SVG ring specs
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  // Group tasks by completion status for a simple interactive CSS Bar graph
  const activeAdmins = users.filter(u => u.role === 'Admin').length;
  const activeUsers = users.filter(u => u.role === 'User').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-layout">
        <Navbar title="Administrative Workspace Console" />

        <main className="main-content animate-fade-in">
          {error && (
            <div className="alert error">
              <Shield size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div style={{
                width: '40px', height: '40px',
                border: '3px solid rgba(255,255,255,0.05)',
                borderTop: '3px solid #a855f7',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : (
            <>
              {/* Analytics Metric Cards Grid */}
              <div className="analytics-grid">
                <div className="stat-card glass-panel">
                  <div className="stat-info">
                    <h3>Total Accounts</h3>
                    <p>{totalUsers}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {activeAdmins} Admins • {activeUsers} Users
                    </span>
                  </div>
                  <div className="stat-icon-wrapper primary">
                    <Users size={24} />
                  </div>
                </div>

                <div className="stat-card glass-panel">
                  <div className="stat-info">
                    <h3>Global Tasks</h3>
                    <p>{totalTasks}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Assigned by active workspace users
                    </span>
                  </div>
                  <div className="stat-icon-wrapper secondary">
                    <FolderKanban size={24} />
                  </div>
                </div>

                <div className="stat-card glass-panel">
                  <div className="stat-info">
                    <h3>Completed Tasks</h3>
                    <p style={{ color: '#34d399' }}>{completedTasks}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {completionRate}% global completion rate
                    </span>
                  </div>
                  <div className="stat-icon-wrapper success">
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                <div className="stat-card glass-panel">
                  <div className="stat-info">
                    <h3>Pending Review</h3>
                    <p style={{ color: '#fbbf24' }}>{pendingTasks}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Waiting for user completion flag
                    </span>
                  </div>
                  <div className="stat-icon-wrapper warning">
                    <Clock size={24} />
                  </div>
                </div>
              </div>

              {/* Charts Dashboard Area */}
              <div className="dashboard-row">
                {/* Custom Interactive SVG Bar Chart card */}
                <div className="glass-panel chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">System Account Directory Audit</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Account Roles & States</span>
                  </div>
                  
                  <div className="custom-chart-container">
                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar" 
                        style={{ height: `${totalUsers > 0 ? (activeUsers / totalUsers) * 160 : 4}px` }}
                      >
                        <div className="chart-tooltip">Standard Users: {activeUsers}</div>
                      </div>
                      <span className="chart-label">Standard Users</span>
                    </div>

                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar" 
                        style={{ 
                          height: `${totalUsers > 0 ? (activeAdmins / totalUsers) * 160 : 4}px`,
                          background: 'linear-gradient(to top, #a855f7, #ec4899)'
                        }}
                      >
                        <div className="chart-tooltip">Admins: {activeAdmins}</div>
                      </div>
                      <span className="chart-label">Administrators</span>
                    </div>

                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar" 
                        style={{ 
                          height: `${totalUsers > 0 ? (inactiveUsers / totalUsers) * 160 : 4}px`,
                          background: 'linear-gradient(to top, #f43f5e, #fb7185)' 
                        }}
                      >
                        <div className="chart-tooltip">Inactive/Suspended: {inactiveUsers}</div>
                      </div>
                      <span className="chart-label">Inactive Accounts</span>
                    </div>
                  </div>
                </div>

                {/* Custom Ring Progress Chart Card */}
                <div className="glass-panel chart-card" style={{ justifyContent: 'center' }}>
                  <div className="chart-header" style={{ marginBottom: '10px' }}>
                    <h3 className="chart-title">Global Task Efficiency</h3>
                  </div>

                  <div className="ring-chart-wrapper">
                    <svg className="ring-svg" width="140" height="140">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <circle className="ring-circle-bg" cx="70" cy="70" r={radius} />
                      <circle 
                        className="ring-circle-fill" 
                        cx="70" 
                        cy="70" 
                        r={radius} 
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>

                    <div className="ring-center-text">
                      <span className="ring-center-val">{completionRate}%</span>
                      <span className="ring-center-lbl">Completed</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }} />
                      <span>{completedTasks} Done</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                      <span>{pendingTasks} Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Section: Recent Logs & Fast Navigation */}
              <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Recent Activities mini-list */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div className="chart-header">
                    <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} style={{ color: '#a855f7' }} />
                      <span>Recent Auditable Events</span>
                    </h3>
                    <Link to="/admin/logs" style={{ color: '#6366f1', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                      View all logs
                    </Link>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {logs.slice(0, 4).map(log => (
                      <div 
                        key={log._id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          paddingBottom: '12px',
                          borderBottom: '1px solid rgba(255,255,255,0.03)'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600 }}>{log.action}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{log.details}</p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-dark)' }}>
                          <p>{log.user ? log.user.name : log.email || 'System'}</p>
                          <p style={{ fontSize: '9px', marginTop: '2px' }}>{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <p style={{ color: 'var(--text-dark)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                        No events logged yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Operations links */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="chart-header" style={{ marginBottom: '12px' }}>
                    <h3 className="chart-title">Quick Actions Panel</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    <Link 
                      to="/admin/users" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '16px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'var(--transition-smooth)'
                      }}
                      className="sidebar-item"
                    >
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700 }}>Block / Unblock Users</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Manage user active states & system bans</p>
                      </div>
                      <ArrowRight size={16} />
                    </Link>

                    <Link 
                      to="/admin/tasks" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '16px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'var(--transition-smooth)'
                      }}
                      className="sidebar-item"
                    >
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700 }}>Task Monitoring Directory</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Audit all tasks across the system and delete items</p>
                      </div>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
