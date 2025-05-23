import React, { useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatSidebar from './chatSideBar';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import { Menu, Settings, MoreVertical } from 'lucide-react';

const ChatRoom = () => {
  const { user } = useAuth();
  const {
    currentChatRoom,
    messages,
    loading,
    error,
    sendMessage,
    loadChatRooms,
    clearError
  } = useChat();
  
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  useEffect(() => {
    if (user && user.id) {
      loadChatRooms(user.id);
    }
  }, [user, loadChatRooms]);

  const handleSendMessage = async (content) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="chat-room">
      {/* 사이드바 */}
      <ChatSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 메인 채팅 영역 */}
      <div className={`chat-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* 채팅 헤더 */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button 
              className="sidebar-toggle"
              onClick={handleToggleSidebar}
              title="채팅 목록"
            >
              <Menu size={20} />
            </button>
            <div className="chat-title">
              <h3>{currentChatRoom?.title || 'SeoulTech Chat'}</h3>
              {currentChatRoom && (
                <span className="chat-subtitle">
                  AI와 대화 중 • {messages.length}개 메시지
                </span>
              )}
            </div>
          </div>
          
          <div className="chat-header-right">
            <button 
              className="chat-settings"
              onClick={() => setSettingsOpen(!settingsOpen)}
              title="설정"
            >
              <MoreVertical size={20} />
            </button>
            
            {settingsOpen && (
              <div className="settings-dropdown">
                <button className="dropdown-item">
                  <Settings size={16} />
                  채팅 설정
                </button>
                <button className="dropdown-item">
                  대화 내보내기
                </button>
                <button className="dropdown-item danger">
                  채팅방 삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <ErrorMessage 
            error={error} 
            onClose={clearError}
            onRetry={() => currentChatRoom && loadChatRooms(user.id)}
          />
        )}

        {/* 채팅 내용 */}
        <div className="chat-content">
          {currentChatRoom ? (
            <>
              <MessageList 
                messages={messages} 
                loading={loading}
                currentUser={user}
              />
              <MessageInput 
                onSend={handleSendMessage}
                disabled={loading}
                placeholder="메시지를 입력하세요..."
              />
            </>
          ) : (
            <div className="chat-welcome">
              <div className="welcome-content">
                <div className="welcome-icon">🤖</div>
                <h2>안녕하세요!</h2>
                <p>서울과학기술대학교 AI 챗봇입니다.</p>
                <p>새로운 채팅을 시작하거나 기존 대화를 이어가세요.</p>
                <button 
                  className="btn btn-primary"
                  onClick={handleToggleSidebar}
                >
                  채팅 시작하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 오버레이 */}
      {(sidebarOpen || settingsOpen) && (
        <div 
          className="overlay"
          onClick={() => {
            setSidebarOpen(false);
            setSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatRoom;