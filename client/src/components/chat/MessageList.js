import React, { useEffect, useRef } from 'react';
import Loading from '../../common/Loading';
import { Bot, User } from 'lucide-react';

const MessageList = ({ messages, loading, currentUser }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString) => {
    if (!dateString) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (messages.length === 0 && !loading) {
    return (
      <div className="message-list-empty">
        <div className="empty-state">
          <Bot size={64} className="empty-icon" />
          <h3>대화를 시작해보세요!</h3>
          <p>아래에 메시지를 입력하면 AI가 답변해드립니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={`${message.id || index}-${message.role}`}
            className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? (
                <div className="user-avatar">
                  {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              ) : (
                <div className="bot-avatar">
                  <Bot size={20} />
                </div>
              )}
            </div>
            
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">
                  {message.role === 'user' ? currentUser?.username || '사용자' : 'SeoulTech Bot'}
                </span>
                <span className="message-time">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <div className="message-body">
                <p>{message.content || message.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message bot-message">
            <div className="message-avatar">
              <div className="bot-avatar">
                <Bot size={20} />
              </div>
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">SeoulTech Bot</span>
              </div>
              <div className="message-body">
                <Loading size="small" text="답변을 생성 중..." />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;