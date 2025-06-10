import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../common/Layout';
import ChatRoom from '../chat/ChatRoom';
import { ROUTES } from '../../utils/constants';

const ChatPage = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // 페이지 로드시 토큰 확인
    console.log('ChatPage - Token:', localStorage.getItem('token'));
    console.log('ChatPage - isAuthenticated:', isAuthenticated);
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Layout>
        <div className="page-loading">
          <div className="loading-spinner" />
          <p>로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    console.log('ChatPage - Not authenticated, redirecting to login');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <Layout showHeader={false} showFooter={false}>
      <div className="chat-page">
        <ChatRoom />
      </div>
    </Layout>
  );
};

export default ChatPage;