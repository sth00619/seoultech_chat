import React, { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import ChatList from './ChatList';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import { Plus, Search, X } from 'lucide-react';

const ChatSidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { 
    chatRooms, 
    currentChatRoom, 
    createChatRoom, 
    selectChatRoom,
    loading 
  } = useChat();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');

  // 사이드바가 열릴 때 기본 채팅방이 없으면 자동 생성
  useEffect(() => {
    if (isOpen && user && chatRooms.length === 0 && !loading) {
      handleCreateDefaultChat();
    }
  }, [isOpen, user, chatRooms.length, loading]);

  const handleCreateDefaultChat = async () => {
    try {
      const newRoom = await createChatRoom(user.id, 'AI와의 대화');
      await selectChatRoom(newRoom);
      onClose(); // 사이드바 닫기
    } catch (error) {
      console.error('Failed to create default chat room:', error);
    }
  };

  const filteredChatRooms = chatRooms.filter(room =>
    room.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChat = async () => {
    if (!newChatTitle.trim()) return;
    
    try {
      const newRoom = await createChatRoom(user.id, newChatTitle);
      await selectChatRoom(newRoom);
      setNewChatTitle('');
      setShowNewChatModal(false);
      onClose();
    } catch (error) {
      console.error('Failed to create chat room:', error);
    }
  };

  const handleSelectChat = async (chatRoom) => {
    await selectChatRoom(chatRoom);
    onClose();
  };

  const handleQuickStart = async () => {
    try {
      // 빠른 시작 - 바로 새 채팅방 생성하고 선택
      const newRoom = await createChatRoom(user.id, `새로운 대화 ${chatRooms.length + 1}`);
      await selectChatRoom(newRoom);
      onClose();
    } catch (error) {
      console.error('Failed to quick start chat:', error);
    }
  };

  return (
    <>
      <div className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>채팅 목록</h3>
          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-actions">
          <Button
            onClick={() => setShowNewChatModal(true)}
            icon={<Plus />}
            fullWidth
            style={{ marginBottom: '0.5rem' }}
          >
            새 채팅
          </Button>
          
          {/* 빠른 시작 버튼 추가 */}
          <Button
            onClick={handleQuickStart}
            variant="outline"
            fullWidth
          >
            빠른 시작
          </Button>
        </div>

        <div className="sidebar-search">
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="채팅 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="sidebar-content">
          {chatRooms.length === 0 && !loading ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>아직 채팅방이 없습니다.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                위의 "빠른 시작" 버튼을 눌러<br />
                바로 대화를 시작해보세요!
              </p>
            </div>
          ) : (
            <ChatList
              chatRooms={filteredChatRooms}
              currentChatRoom={currentChatRoom}
              onSelectChat={handleSelectChat}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* 새 채팅 생성 모달 */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title="새 채팅 만들기"
        size="small"
      >
        <div className="new-chat-form">
          <div className="form-group">
            <label className="form-label">채팅방 제목</label>
            <input
              type="text"
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              placeholder="채팅방 제목을 입력하세요"
              className="form-input"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newChatTitle.trim()) {
                  handleCreateChat();
                }
              }}
            />
          </div>
          <div className="modal-actions">
            <Button
              variant="outline"
              onClick={() => setShowNewChatModal(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={!newChatTitle.trim()}
            >
              생성
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChatSidebar;