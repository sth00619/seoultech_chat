import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import Button from '../../common/Button';
import ErrorMessage from '../../common/ErrorMessage';
import { Mail, User, Lock, Eye, EyeOff } from 'lucide-react';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    if (!formData.username) {
      newErrors.username = '사용자명을 입력해주세요.';
    } else if (formData.username.length < 2) {
      newErrors.username = '사용자명은 최소 2자 이상이어야 합니다.';
    }
    
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
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
      // password_hash 대신 password로 전송
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password // password_hash가 아닌 password
      });
      navigate(ROUTES.LOGIN);
    } catch (err) {
      // 에러는 AuthContext에서 처리됨
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>회원가입</h2>
          <p>SeoulTech Chat에 가입하여 AI와 대화해보세요!</p>
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
            <label htmlFor="username" className="form-label">
              사용자명
            </label>
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="사용자명을 입력하세요"
                className={`form-input ${errors.username ? 'error' : ''}`}
                autoComplete="username"
              />
            </div>
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <div className="input-group">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
                className={`form-input ${errors.email ? 'error' : ''}`}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                className={`form-input ${errors.password ? 'error' : ''}`}
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              비밀번호 확인
            </label>
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>

          <Button
            type="submit"
            loading={loading}
            fullWidth
            size="large"
          >
            회원가입
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to={ROUTES.LOGIN} className="auth-link">
              로그인
            </Link>
          </p>
          <p style={{ marginTop: '1rem' }}>
            <Link to={ROUTES.HOME} className="auth-link">
              홈으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;