import React from 'react';
import Loading from '../../common/Loading';
import { MessageCircle, Clock } from 'lucide-react';

const ChatList = ({ chatRooms, currentChatRoom, onSelectChat, loading }) => {
  if (loading) {
    return (
      <div className="chat-list-loading">
        <Loading size="small" text="채팅 목록을 불러오는 중..." />
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="chat-list-empty">
        <MessageCircle size={48} className="empty-icon" />
        <h4>채팅이 없습니다</h4>
        <p>새로운 채팅을 시작해보세요!</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="chat-list">
      {chatRooms.map((chatRoom) => (
        <div
          key={chatRoom.id}
          className={`chat-list-item ${
            currentChatRoom?.id === chatRoom.id ? 'active' : ''
          }`}
          onClick={() => onSelectChat(chatRoom)}
        >
          <div className="chat-item-content">
            <div className="chat-item-header">
              <h4 className="chat-item-title">{chatRoom.title}</h4>
              <span className="chat-item-time">
                <Clock size={12} />
                {formatDate(chatRoom.updated_at)}
              </span>
            </div>
            <p className="chat-item-preview">
              {chatRoom.last_message || 'AI와 대화를 시작해보세요!'}
            </p>
          </div>
          <div className="chat-item-indicator">
            <MessageCircle size={16} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;