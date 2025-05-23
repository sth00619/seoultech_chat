import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../common/Layout';
import ChatRoom from '../chat/ChatRoom';
import { ROUTES } from '../../utils/constants';

const ChatPage = () => {
  const { isAuthenticated, loading } = useAuth();

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