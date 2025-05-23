import React, { useState, useRef } from 'react';
import Button from '../../common/Button';
import { Send, Paperclip, Smile } from 'lucide-react';

const MessageInput = ({ onSend, disabled = false, placeholder = "메시지를 입력하세요..." }) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      adjustTextareaHeight();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleFileUpload = () => {
    // 파일 업로드 기능 구현 예정
    console.log('File upload clicked');
  };

  const handleEmojiPicker = () => {
    // 이모지 피커 기능 구현 예정
    console.log('Emoji picker clicked');
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-actions-left">
          <button
            type="button"
            onClick={handleFileUpload}
            className="input-action-btn"
            title="파일 첨부"
            disabled={disabled}
          >
            <Paperclip size={18} />
          </button>
        </div>

        <div className="message-input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={disabled}
            className="message-textarea"
            rows={1}
          />
        </div>

        <div className="input-actions-right">
          <button
            type="button"
            onClick={handleEmojiPicker}
            className="input-action-btn"
            title="이모지"
            disabled={disabled}
          >
            <Smile size={18} />
          </button>
          
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            icon={<Send />}
            size="small"
            title="전송 (Enter)"
          >
            전송
          </Button>
        </div>
      </form>
      
      <div className="input-help-text">
        <span>Enter로 전송, Shift+Enter로 줄바꿈</span>
      </div>
    </div>
  );
};

export default MessageInput;