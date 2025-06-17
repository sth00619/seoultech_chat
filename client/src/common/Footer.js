import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>SeoulTech Chat</h4>
            <p>An AI chat platform made for students of Seoul National University of Science and Technology</p>
          </div>

          <div className="footer-section">
            <h4>Links</h4>
            <ul>
              <li><a href="https://seoultech.ac.kr" target="_blank" rel="noopener noreferrer">SeoulTech Official Site</a></li>
              <li><a href="/api-docs" target="_blank" rel="noopener noreferrer">API Documentation</a></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:support@seoultech-chat.com">Contact Us</a></li>
              <li><a href="/help">Help Center</a></li>
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