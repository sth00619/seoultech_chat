import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../common/Layout';
import Button from '../../common/Button';
import { ROUTES } from '../../utils/constants';
import { MessageCircle, Users, Zap, Shield, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const features = [
    {
      icon: <MessageCircle size={32} />,
      title: 'AI Chat',
      description: 'Chat in real time with an AI tailored for SeoulTech students.'
    },
    {
      icon: <Users size={32} />,
      title: 'Student Community',
      description: 'Connect and share information with fellow students at your university.'
    },
    {
      icon: <Zap size={32} />,
      title: 'Instant Response',
      description: 'Ask anything and get immediate answers—no waiting.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Secure Platform',
      description: 'Access a safe and trusted space through school authentication.'
    }
  ];

  return (
    <Layout>
      <div className="home-page">
        {/* 히어로 섹션 */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">
                  Seoul National University of Science and Technology
                  <br />
                  <span className="highlight">AI Chat Platform</span>
                </h1>
                <p className="hero-description">
                  Ask anything about academics, careers, or campus life.
                  <br />
                  Enjoy a unique chat experience designed just for SeoulTech students.
                </p>

                <div className="hero-actions">
                  {isAuthenticated ? (
                    <div className="authenticated-actions">
                      <p className="welcome-message">
                        Welcome, <strong>{user?.username}</strong>!
                      </p>
                      <Link to={ROUTES.CHAT}>
                        <Button size="large" icon={<ArrowRight />}>
                          Start Chatting
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="auth-actions">
                      <Link to={ROUTES.REGISTER}>
                        <Button size="large">
                          Get Started
                        </Button>
                      </Link>
                      <Link to={ROUTES.LOGIN}>
                        <Button variant="outline" size="large">
                          Log In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="hero-image">
                <div className="hero-illustration">
                  <div className="chat-bubble bot">
                    <MessageCircle size={24} />
                    <p>Hello! I'm the AI for SeoulTech students.</p>
                  </div>
                  <div className="chat-bubble user">
                    <p>I have some questions about campus life!</p>
                  </div>
                  <div className="chat-bubble bot">
                    <p>Ask me anything — I'm here to help!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 기능 섹션 */}
        <section className="features-section">
          <div className="container">
            <div className="section-header">
              <h2>Main Features</h2>
              <p>Discover the key features that make SeoulTech Chat special.</p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Start your journey now!</h2>
              <p>A smarter chat experience built for SeoulTech students</p>

              {!isAuthenticated && (
                <div className="cta-actions">
                  <Link to={ROUTES.REGISTER}>
                    <Button size="large">
                      Start for Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;