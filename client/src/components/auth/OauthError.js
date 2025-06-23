import React from 'react';
import { AlertCircle } from 'lucide-react';

const OAuthError = ({ error }) => {
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'oauth_failed':
        return '네이버 로그인에 실패했습니다. 다시 시도해주세요.';
      case 'oauth_error':
        return '로그인 처리 중 오류가 발생했습니다.';
      case 'missing_token':
        return '인증 정보가 없습니다. 다시 로그인해주세요.';
      default:
        return '로그인 중 문제가 발생했습니다.';
    }
  };

  if (!error) return null;

  return (
    <div className="oauth-error">
      <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />
      {getErrorMessage(error)}
    </div>
  );
};

export default OAuthError;