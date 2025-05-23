import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../common/Layout';
import RegisterForm from '../auth/RegisterForm';
import { ROUTES } from '../../utils/constants';

const RegisterPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="page-loading">로딩 중...</div>
      </Layout>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.CHAT} replace />;
  }

  return (
    <Layout>
      <div className="auth-page">
        <RegisterForm />
      </div>
    </Layout>
  );
};

export default RegisterPage;