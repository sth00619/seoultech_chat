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
    { to: ROUTES.HOME, icon: Home, label: '홈' },
    { to: ROUTES.CHAT, icon: MessageCircle, label: '채팅', requireAuth: true },
    { to: ROUTES.USERS, icon: Users, label: '사용자', requireAuth: true },
  ];

  return (
    <header className="header">
      <div className="header-container">
        {/* 로고 */}
        <Link to={ROUTES.HOME} className="logo">
          <MessageCircle size={24} />
          <span>SeoulTech Chat</span>
        </Link>

        {/* 데스크톱 네비게이션 */}
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

        {/* 헤더 액션들 */}
        <div className="header-actions">
          {/* 테마 토글 */}
          <button onClick={toggleTheme} className="theme-toggle" title="테마 변경">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* 사용자 메뉴 */}
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
                    프로필
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to={ROUTES.LOGIN} className="btn btn-outline">로그인</Link>
              <Link to={ROUTES.REGISTER} className="btn btn-primary">회원가입</Link>
            </div>
          )}

          {/* 모바일 메뉴 토글 */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-toggle"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
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
                로그인
              </Link>
              <Link to={ROUTES.REGISTER} className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                회원가입
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 오버레이 */}
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