import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../common/Layout';
import UserProfile from '../auth/UserProfile';
import { ROUTES } from '../../utils/constants';

const ProfilePage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="page-loading">로딩 중...</div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <Layout>
      <div className="profile-page">
        <div className="container">
          <div className="page-header">
            <h1>프로필</h1>
            <p>개인 정보를 관리하고 설정을 변경하세요.</p>
          </div>
          <UserProfile />
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;