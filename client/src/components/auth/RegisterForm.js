import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password_hash: formData.password
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('회원가입이 완료되었습니다! 로그인 페이지로 이동하세요.');
      } else {
        setMessage(`오류: ${data.error || '회원가입에 실패했습니다.'}`);
      }
    } catch (error) {
      setMessage(`네트워크 오류: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>회원가입</h2>
          <p>SeoulTech Chat에 가입하여 AI와 대화해보세요!</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">사용자명</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              placeholder="사용자명을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        {message && <div className="message">{message}</div>}

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="auth-link">로그인</Link>
          </p>
          <p style={{ marginTop: '1rem' }}>
            <Link to="/" className="auth-link">홈으로 돌아가기</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;