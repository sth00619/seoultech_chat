// src/pages/AboutPage.js
import React from 'react';
import Layout from '../../common/Layout';
import '../../styles/pages.css';

const AboutPage = () => {
  return (
    <Layout>
      <div className="about-container">
        <h1>About Us</h1>

        <section>
          <h2>Our Mission</h2>
          <p>
            SeoulTech Chat is an AI-based chatbot platform developed by Team 7
            at Seoul National University of Science and Technology. Our goal is
            to provide students with fast and accurate access to academic and
            administrative information through an intuitive, secure, and friendly
            interface.
          </p>
        </section>

        <section>
          <h2>Team Members</h2>
          <div className="member">
            <img src="/images/pang.png" alt="Song" />
            <div>
              <p><strong>Chief Backend Developer: Song</strong></p>
              <p><em>"24 hours working"</em></p>
            </div>
          </div>

          <div className="member">
            <img src="/images/lim.png" alt="Lim" />
            <div>
              <p><strong>Chief Frontend Developer: Lim</strong></p>
              <p><em>"Make world beautiful"</em></p>
            </div>
          </div>

          <div className="member">
            <img src="/images/cheng.png" alt="Cheng" />
            <div>
              <p><strong>CEO / DevOps Engineer: Cheng</strong></p>
              <p><em>"Make one-to-one Chatbot AI solution, Please contact us"</em></p>
            </div>
          </div>
        </section>

        <section>
          <h2>Core Technologies</h2>
          <ul>
            <li>React 18 with Function Components and Hooks</li>
            <li>React Router v6</li>
            <li>Context API for state management</li>
            <li>Axios for backend communication</li>
            <li>Dark mode support using custom CSS variables</li>
            <li>Lucide React for icons</li>
          </ul>
        </section>

        <section>
          <h2>Key Features</h2>
          <ul>
            <li>Secure user registration and login with JWT</li>
            <li>Keyword-based automated response system</li>
            <li>Custom chat interface with chat room management</li>
            <li>ChatGPT API integration (in progress)</li>
          </ul>
        </section>

        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '2rem' }}>
          For inquiries or feedback, please reach out to the team via the contact section.
        </p>
      </div>
    </Layout>
  );
};

export default AboutPage;