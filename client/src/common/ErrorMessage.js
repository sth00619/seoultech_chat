import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ 
  error, 
  onClose, 
  onRetry, 
  type = 'error',
  showIcon = true 
}) => {
  const getTypeClass = () => {
    switch (type) {
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      case 'success': return 'alert-success';
      default: return 'alert-error';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning': return <AlertCircle size={20} />;
      case 'info': return <AlertCircle size={20} />;
      case 'success': return <AlertCircle size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  return (
    <div className={`alert ${getTypeClass()}`}>
      <div className="alert-content">
        {showIcon && <div className="alert-icon">{getIcon()}</div>}
        <div className="alert-message">
          {typeof error === 'string' ? error : error?.message || '오류가 발생했습니다.'}
        </div>
      </div>
      
      <div className="alert-actions">
        {onRetry && (
          <button onClick={onRetry} className="btn btn-sm btn-outline">
            다시 시도
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="alert-close">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;