import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import Button from '../../common/Button';
import ErrorMessage from '../../common/ErrorMessage';
import { User, Mail, Edit2, Save, X } from 'lucide-react';

const UserProfile = () => {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [errors, setErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
    
    // 에러 메시지 초기화
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = '사용자명을 입력해주세요.';
    } else if (formData.username.length < 2) {
      newErrors.username = '사용자명은 최소 2자 이상이어야 합니다.';
    }
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      
      // userService를 사용하여 사용자 정보 업데이트
      await userService.updateUser(user.id, {
        username: formData.username,
        email: formData.email
      });
      
      // 로컬 스토리지의 사용자 정보도 업데이트
      const updatedUser = {
        ...user,
        username: formData.username,
        email: formData.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // 성공 메시지를 3초 후에 자동으로 숨김
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      
      // 페이지 새로고침으로 전체 상태 업데이트
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Profile update error:', error);
      setUpdateError(error.response?.data?.error || '프로필 업데이트에 실패했습니다.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || ''
    });
    setErrors({});
    setUpdateError(null);
    setUpdateSuccess(false);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  if (loading) {
    return <div className="profile-loading">프로필을 불러오는 중...</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <div className="profile-info">
          <h2>{isEditing ? '프로필 수정' : user?.username}</h2>
          <p>{user?.email}</p>
        </div>
        {!isEditing && (
          <Button
            onClick={handleEditClick}
            variant="outline"
            icon={<Edit2 />}
          >
            편집
          </Button>
        )}
      </div>

      {updateError && (
        <ErrorMessage 
          error={updateError} 
          onClose={() => setUpdateError(null)}
          type="error"
        />
      )}
      
      {updateSuccess && (
        <ErrorMessage 
          error="프로필이 성공적으로 업데이트되었습니다!" 
          onClose={() => setUpdateSuccess(false)}
          type="success"
        />
      )}

      <div className="profile-body">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                사용자명
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="사용자명을 입력하세요"
                autoFocus
              />
              {errors.username && <span className="form-error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="이메일을 입력하세요"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                loading={updateLoading}
                icon={<Save />}
                disabled={updateLoading}
              >
                저장
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                icon={<X />}
                disabled={updateLoading}
              >
                취소
              </Button>
            </div>
          </form>
        ) : (
          <div className="profile-display">
            <div className="profile-field">
              <label>사용자명</label>
              <p>{user?.username}</p>
            </div>
            <div className="profile-field">
              <label>이메일</label>
              <p>{user?.email}</p>
            </div>
            <div className="profile-field">
              <label>가입일</label>
              <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;