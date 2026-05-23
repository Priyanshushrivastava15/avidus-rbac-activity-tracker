import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus, KeyRound, Mail, User, Shield } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);

    try {
      const data = await register(name, email, password, role);
      // Redirect based on role
      if (data.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setFormError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <UserPlus size={22} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Sign up to get started with task tracking</p>
        </div>

        {formError && (
          <div className="alert error">
            <ShieldAlert size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="filter-input-wrapper">
              <User className="filter-icon" size={16} />
              <input
                type="text"
                className="glass-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="filter-input-wrapper">
              <Mail className="filter-icon" size={16} />
              <input
                type="email"
                className="glass-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="filter-input-wrapper">
              <KeyRound className="filter-icon" size={16} />
              <input
                type="password"
                className="glass-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div className="filter-input-wrapper">
              <Shield className="filter-icon" size={16} />
              <select
                className="filter-select"
                style={{ width: '100%', paddingLeft: '42px' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="User">Standard User (Tasks CRUD only)</option>
                <option value="Admin">Administrator (Dashboard + All Management Controls)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="glass-btn"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
