import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatSidebar from './ChatSidebar';
import Loading from '../../common/Loading';
import ErrorMessage from '../../common/ErrorMessage';
import { Menu, Settings, MoreVertical, Download, Trash2 } from 'lucide-react';

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
    selectChatRoom,
    deleteChatRoom
  } = useChat();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasLoadedChatRooms, setHasLoadedChatRooms] = useState(false);
  const settingsRef = useRef(null);

  // useEffect를 안전하게 처리하기 위해 별도의 상태로 관리
  useEffect(() => {
    if (user && user.id && !hasLoadedChatRooms) {
      loadChatRooms(user.id);
      setHasLoadedChatRooms(true);
    }
  }, [user?.id, hasLoadedChatRooms, loadChatRooms]);

  // 설정 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };

    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsOpen]);

  const handleSendMessage = useCallback(async (content) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [sendMessage]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
    setSettingsOpen(false); // 사이드바 열 때 설정 메뉴 닫기
  }, []);

  const handleToggleSettings = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
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

  // 설정 메뉴 핸들러들
  const handleExportChat = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentChatRoom || messages.length === 0) {
      alert('내보낼 메시지가 없습니다.');
      return;
    }

    // 메시지들을 텍스트 형태로 변환
    const chatData = messages.map(msg => 
      `[${new Date(msg.created_at).toLocaleString()}] ${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`
    ).join('\n');

    // 파일 다운로드
    const blob = new Blob([chatData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentChatRoom.title}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSettingsOpen(false);
  }, [currentChatRoom, messages]);

  const handleDeleteChat = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentChatRoom) return;

    const confirmed = window.confirm(`"${currentChatRoom.title}" 채팅방을 정말 삭제하시겠습니까?`);
    if (confirmed) {
      try {
        await deleteChatRoom(currentChatRoom.id);
        setSettingsOpen(false);
      } catch (error) {
        console.error('Failed to delete chat room:', error);
        alert('채팅방 삭제에 실패했습니다.');
      }
    }
  }, [currentChatRoom, deleteChatRoom]);

  const handleChatSettings = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    alert('채팅 설정 기능은 준비 중입니다.');
    setSettingsOpen(false);
  }, []);

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
              type="button"
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
          
          <div className="chat-header-right" ref={settingsRef}>
            <button 
              className="chat-settings"
              onClick={handleToggleSettings}
              title="설정"
              type="button"
            >
              <MoreVertical size={20} />
            </button>
            
            {settingsOpen && (
              <div className="settings-dropdown">
                <button 
                  className="dropdown-item"
                  onClick={handleChatSettings}
                  type="button"
                >
                  <Settings size={16} />
                  채팅 설정
                </button>
                <button 
                  className="dropdown-item"
                  onClick={handleExportChat}
                  disabled={!currentChatRoom || messages.length === 0}
                  type="button"
                >
                  <Download size={16} />
                  대화 내보내기
                </button>
                <button 
                  className="dropdown-item danger"
                  onClick={handleDeleteChat}
                  disabled={!currentChatRoom}
                  type="button"
                >
                  <Trash2 size={16} />
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
                    type="button"
                  >
                    바로 시작하기
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={handleToggleSidebar}
                    style={{ padding: '0.75rem 1.5rem' }}
                    type="button"
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