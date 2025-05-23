import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import ChatList from './ChatList';
import Button from '../common/Button';
import Modal from '../common/Modal';
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
          >
            새 채팅
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
          <ChatList
            chatRooms={filteredChatRooms}
            currentChatRoom={currentChatRoom}
            onSelectChat={handleSelectChat}
            loading={loading}
          />
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