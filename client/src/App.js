import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ROUTES } from './utils/constants';

// Pages
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ChatPage from './components/pages/ChatPage';
import ProfilePage from './components/pages/ProfilePage';

// Styles
import './styles/globals.css';
import './styles/components.css';
import './styles/pages.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* 모든 라우트를 챗봇 페이지로 리다이렉트 */}
                <Route path="*" element={<ChatPage />} />
                <Route path={ROUTES.HOME} element={<ChatPage />} />
                <Route path={ROUTES.LOGIN} element={<ChatPage />} />
                <Route path={ROUTES.REGISTER} element={<ChatPage />} />
                <Route path={ROUTES.CHAT} element={<ChatPage />} />
                <Route path={ROUTES.PROFILE} element={<ChatPage />} />
              </Routes>
            </div>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;