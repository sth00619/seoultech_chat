import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { showSwaggerToken } from './utils/swaggerHelper'; 
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
import AboutPage from './components/pages/AboutPage';
import OAuthCallbackPage from './components/pages/OAuthCallbackPage';

// Styles
import './styles/globals.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/oauth.css';

function App() {
  useEffect(() => {
    // 개발 환경에서 전역 함수로 등록
    if (process.env.NODE_ENV === 'development') {
      window.swaggerToken = showSwaggerToken;
      console.log('%c💡 Tip: 콘솔에서 swaggerToken() 을 입력하면 언제든 토큰을 확인할 수 있습니다.', 
        'color: #3498db; background: #ecf0f1; padding: 5px; border-radius: 3px;');
      
      // 로그인된 상태면 바로 토큰 표시
      const token = localStorage.getItem('token');
      if (token) {
        console.log('%c✅ 로그인된 상태입니다. Swagger 토큰:', 'color: #27ae60; font-weight: bold;');
        console.log('%cBearer ' + token, 'color: #2c3e50; background: #ecf0f1; padding: 5px;');
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                <Route path={ROUTES.CHAT} element={<ChatPage />} />
                <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                <Route path={ROUTES.ABOUT} element={<AboutPage />} />
                <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </div>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;