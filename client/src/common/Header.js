import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES } from '../utils/constants';
import { User, Moon, Sun, Menu, X, MessageCircle, Users, Home } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setIsUserMenuOpen(false);
  };

  const navigationItems = [
    { to: ROUTES.HOME, icon: Home, label: 'Home' },
    { to: ROUTES.CHAT, icon: MessageCircle, label: 'Chat', requireAuth: true },
    { to: ROUTES.USERS, icon: Users, label: 'Users', requireAuth: true },
  ];

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="logo">
          <MessageCircle size={24} />
          <span>SeoulTech Chat</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navigationItems.map(({ to, icon: Icon, label, requireAuth }) => {
            if (requireAuth && !isAuthenticated) return null;
            return (
              <Link key={to} to={to} className="nav-link">
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="user-menu-trigger"
              >
                <div className="user-avatar">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="user-name">{user?.username}</span>
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-dropdown">
                  <div className="user-info">
                    <div className="user-name">{user?.username}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                  <hr />
                  <Link to={ROUTES.PROFILE} className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                    <User size={16} />
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to={ROUTES.LOGIN} className="btn btn-outline">Log In</Link>
              <Link to={ROUTES.REGISTER} className="btn btn-primary">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-toggle"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          {navigationItems.map(({ to, icon: Icon, label, requireAuth }) => {
            if (requireAuth && !isAuthenticated) return null;
            return (
              <Link 
                key={to} 
                to={to} 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
          
          {!isAuthenticated && (
            <div className="mobile-auth-buttons">
              <Link to={ROUTES.LOGIN} className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>
                Log In
              </Link>
              <Link to={ROUTES.REGISTER} className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {(isMenuOpen || isUserMenuOpen) && (
        <div 
          className="overlay" 
          onClick={() => {
            setIsMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;