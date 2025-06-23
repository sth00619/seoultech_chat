import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import Button from '../../common/Button';
import ErrorMessage from '../../common/ErrorMessage';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 입력 시 해당 필드 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // 전역 에러 제거
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await login(formData.email, formData.password);
      console.log('Login response:', response); // 디버깅용

      // 토큰이 저장되었는지 확인
      setTimeout(() => {
        console.log('Token after login:', localStorage.getItem('token'));
        console.log('User after login:', localStorage.getItem('user'));

        // 채팅 페이지로 이동
        navigate(ROUTES.CHAT);
      }, 100); // 약간의 지연을 줘서 localStorage 저장 보장

    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>Log In</h2>
          <p>Welcome to SeoulTech Chat!</p>
        </div>

        {error && (
          <ErrorMessage
            error={error}
            onClose={clearError}
            type="error"
          />
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              email
            </label>
            <div className="input-group">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              password
            </label>
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <Button
            type="submit"
            loading={loading}
            fullWidth
            size="large"
          >
            Log In
          </Button>

          {/* OAuth 구분선 */}
          <div className="oauth-divider">
            <span>또는</span>
          </div>

          {/* 네이버 로그인 버튼 */}
          <button
            type="button"
            onClick={() => window.location.href = 'http://localhost:3000/api/auth/naver'}
            style={{
              width: '100%',
              backgroundColor: '#03C75A',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 16px',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#02b351'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#03C75A'}
          >
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='white' d='M13.5 10.5L8.5 3H3v14h6.5V9.5l5 7.5H20V3h-6.5v7.5z'/%3E%3C/svg%3E" 
              alt="N"
              style={{ 
                width: '20px', 
                height: '20px',
                display: 'block'
              }}
            />
            <span style={{ display: 'block', lineHeight: '1' }}>네이버로 시작하기</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="auth-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;