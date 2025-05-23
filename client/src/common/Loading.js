import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ size = 'medium', text = '로딩 중...', fullScreen = false }) => {
  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60
  };

  const LoadingContent = () => (
    <div className={`loading ${size}`}>
      <Loader2 size={sizeMap[size]} className="spinner" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

export default Loading;