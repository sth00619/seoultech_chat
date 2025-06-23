import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../common/Loading';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth Error:', error);
        navigate('/login?error=' + error);
        return;
      }

      if (token && refreshToken) {
        try {
          // 토큰 저장
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);

          // 토큰 디코드하여 사용자 정보 추출
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // 사용자 정보 API 호출
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('isAuthenticated', 'true');
            
            // 채팅 페이지로 이동
            navigate('/chat');
          } else {
            throw new Error('Failed to get user info');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          navigate('/login?error=oauth_failed');
        }
      } else {
        navigate('/login?error=missing_token');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <Loading size="large" text="로그인 처리 중..." />
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
        잠시만 기다려주세요...
      </p>
    </div>
  );
};

export default OAuthCallbackPage;