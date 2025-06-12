import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatSidebar from './ChatSidebar';
import Loading from '../../common/Loading';
import ErrorMessage from '../../common/ErrorMessage';
import { Menu, MoreVertical, LogOut, Download, Trash2 } from 'lucide-react';

const ChatRoom = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // useEffect를 안전하게 처리하기 위해 별도의 상태로 관리
  useEffect(() => {
    if (user && user.id && !hasLoadedChatRooms) {
      loadChatRooms(user.id);
      setHasLoadedChatRooms(true);
    }
  }, [user?.id, hasLoadedChatRooms, loadChatRooms]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };

    if (settingsOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
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
  }, []);

  const handleToggleSettings = useCallback((e) => {
    e.stopPropagation();
    setSettingsOpen(prev => !prev);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // 대화 내보내기 함수
  const handleExportChat = () => {
    console.log('대화 내보내기 클릭됨');
    
    if (!messages || messages.length === 0) {
      alert('내보낼 대화가 없습니다.');
      return;
    }

    try {
      const chatContent = messages.map(msg => 
        `[${msg.role === 'user' ? '사용자' : 'AI'}] ${msg.content || msg.text || ''}`
      ).join('\n\n');

      const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${currentChatRoom?.title || '채팅'}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('대화 내보내기가 완료되었습니다.');
      setSettingsOpen(false);
    } catch (error) {
      console.error('대화 내보내기 실패:', error);
      alert('대화 내보내기에 실패했습니다.');
    }
  };

  // 채팅방 삭제 함수
  const handleDeleteChatRoom = async () => {
    console.log('채팅방 삭제 클릭됨');
    
    if (!currentChatRoom) {
      alert('삭제할 채팅방이 없습니다.');
      return;
    }
    
    if (window.confirm('정말로 이 채팅방을 삭제하시겠습니까?')) {
      try {
        await deleteChatRoom(currentChatRoom.id);
        alert('채팅방이 삭제되었습니다.');
        setSettingsOpen(false);
      } catch (error) {
        console.error('채팅방 삭제 실패:', error);
        alert('채팅방 삭제에 실패했습니다.');
      }
    }
  };

  // 로그아웃 함수
  const handleLogout = async () => {
    console.log('로그아웃 클릭됨');
    
    try {
      // logout 함수가 있으면 사용, 없으면 직접 처리
      if (typeof logout === 'function') {
        await logout();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
      }
      
      // 홈으로 이동
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 강제로 로그아웃 처리
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/');
    }
  };

  const handleRetry = useCallback(() => {
    if (user?.id) {
      setHasLoadedChatRooms(false);
    }
  }, [user?.id]);

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
              ref={buttonRef}
              className="chat-settings"
              onClick={handleToggleSettings}
              title="설정"
            >
              <MoreVertical size={20} />
            </button>
            
            {settingsOpen && (
              <div ref={dropdownRef} className="settings-dropdown">
                <div 
                  className="dropdown-item"
                  onClick={handleExportChat}
                >
                  <Download size={16} />
                  <span>대화 내보내기</span>
                </div>
                <div 
                  className={`dropdown-item danger ${!currentChatRoom ? 'disabled' : ''}`}
                  onClick={currentChatRoom ? handleDeleteChatRoom : null}
                >
                  <Trash2 size={16} />
                  <span>채팅방 삭제</span>
                </div>
                <hr className="dropdown-divider" />
                <div 
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>로그아웃</span>
                </div>
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

      {/* 사이드바 오버레이 */}
      {sidebarOpen && (
        <div 
          className="overlay"
          onClick={handleCloseOverlay}
        />
      )}
    </div>
  );
};

export default ChatRoom;