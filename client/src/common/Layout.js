import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/components.css';

const Layout = ({ children, showHeader = true, showFooter = true }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`layout ${isDarkMode ? 'dark' : 'light'}`}>
      {showHeader && <Header />}
      <main className="main-content">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
