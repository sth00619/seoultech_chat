import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>SeoulTech Chat</h4>
            <p>서울과학기술대학교 학생들을 위한 AI 채팅 플랫폼</p>
          </div>
          
          <div className="footer-section">
            <h4>링크</h4>
            <ul>
              <li><a href="https://seoultech.ac.kr" target="_blank" rel="noopener noreferrer">서울과학기술대학교</a></li>
              <li><a href="/api-docs" target="_blank" rel="noopener noreferrer">API 문서</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>지원</h4>
            <ul>
              <li><a href="mailto:support@seoultech-chat.com">문의하기</a></li>
              <li><a href="/help">도움말</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>
            Made with <Heart size={16} className="heart" /> for SeoulTech Students
          </p>
          <p>&copy; 2024 SeoulTech Chat. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;