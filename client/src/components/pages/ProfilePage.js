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
        <div className="page-loading">Loading...</div>
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
            <h1>Profile</h1>
            <p>Manage your personal information and update your settings.</p>
          </div>
          <UserProfile />
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;