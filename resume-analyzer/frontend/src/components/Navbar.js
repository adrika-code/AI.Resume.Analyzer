import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LayoutDashboard, Upload, Clock, LogOut, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Analyze', icon: Upload },
    { to: '/history', label: 'History', icon: Clock },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64, gap: 32 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Clash Display', fontWeight: 600, fontSize: 18, color: 'var(--text)' }}>ResumeAI</span>
        </Link>

        {isAuthenticated && (
          <div style={{ display: 'flex', gap: 4, flex: 1 }}>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500,
                color: location.pathname === to ? 'var(--accent-bright)' : 'var(--text-muted)',
                background: location.pathname === to ? 'rgba(124,92,191,0.12)' : 'transparent',
                transition: 'all 0.2s'
              }}>
                <Icon size={15} /> {label}
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: 'white'
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-dim)', display: 'none' }}>{user?.name}</span>
              </div>
              <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '6px 12px' }}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ textDecoration: 'none' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
