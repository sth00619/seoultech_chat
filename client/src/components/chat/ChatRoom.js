import React, { useEffect, useState, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatSidebar from './ChatSidebar';
import Loading from '../../common/Loading';
import ErrorMessage from '../../common/ErrorMessage';
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
    clearError,
    createChatRoom,
    selectChatRoom
  } = useChat();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasLoadedChatRooms, setHasLoadedChatRooms] = useState(false);

  // useEffect를 안전하게 처리하기 위해 별도의 상태로 관리
  useEffect(() => {
    if (user && user.id && !hasLoadedChatRooms) {
      loadChatRooms(user.id);
      setHasLoadedChatRooms(true);
    }
  }, [user?.id, hasLoadedChatRooms, loadChatRooms]);

  const handleSendMessage = useCallback(async (content) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [sendMessage]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleToggleSettings = useCallback(() => {
    setSettingsOpen(prev => !prev);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setSidebarOpen(false);
    setSettingsOpen(false);
  }, []);

  const handleRetry = useCallback(() => {
    if (user?.id) {
      setHasLoadedChatRooms(false); // 재로드를 위해 상태 리셋
    }
  }, [user?.id]);

  // 빠른 시작 기능
  const handleQuickStart = useCallback(async () => {
    try {
      const newRoom = await createChatRoom(user.id, 'AI와의 첫 대화');
      await selectChatRoom(newRoom);
    } catch (error) {
      console.error('Failed to quick start:', error);
    }
  }, [user?.id, createChatRoom, selectChatRoom]);

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
              <h3>{currentChatRoom?.title || 'SeoulTech Chat - 테스트 모드'}</h3>
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
              onClick={handleToggleSettings}
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
            onRetry={handleRetry}
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
                <h2>서울과학기술대학교 AI 챗봇</h2>
                <p>안녕하세요! 테스트 모드로 실행 중입니다.</p>
                <p>새로운 채팅을 시작하여 AI와 대화해보세요.</p>
                
                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <p><strong>💡 추천 질문들:</strong></p>
                  <ul style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                    <li>"안녕하세요"</li>
                    <li>"서울과기대에 대해 알려주세요"</li>
                    <li>"전공 정보가 궁금해요"</li>
                    <li>"취업률은 어떤가요?"</li>
                    <li>"캠퍼스 생활은 어떤가요?"</li>
                  </ul>
                </div>
                
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={handleQuickStart}
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    바로 시작하기
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={handleToggleSidebar}
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    채팅 목록 보기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 오버레이 */}
      {(sidebarOpen || settingsOpen) && (
        <div 
          className="overlay"
          onClick={handleCloseOverlay}
        />
      )}
    </div>
  );
};

export default ChatRoom;