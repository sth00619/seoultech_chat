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
      title: 'AI 채팅',
      description: '서울과학기술대학교 특화 AI와 실시간 대화를 나눠보세요.'
    },
    {
      icon: <Users size={32} />,
      title: '학생 커뮤니티',
      description: '같은 학교 학생들과 소통하고 정보를 공유하세요.'
    },
    {
      icon: <Zap size={32} />,
      title: '빠른 응답',
      description: '궁금한 것이 있으면 즉시 답변을 받아보세요.'
    },
    {
      icon: <Shield size={32} />,
      title: '안전한 환경',
      description: '학교 인증을 통한 안전하고 신뢰할 수 있는 플랫폼입니다.'
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
                  서울과학기술대학교
                  <br />
                  <span className="highlight">AI 채팅 플랫폼</span>
                </h1>
                <p className="hero-description">
                  학업, 진로, 학교생활에 대한 궁금증을 AI와 함께 해결해보세요.
                  <br />
                  서울과학기술대학교 학생들을 위한 특별한 채팅 경험을 제공합니다.
                </p>
                
                <div className="hero-actions">
                  {isAuthenticated ? (
                    <div className="authenticated-actions">
                      <p className="welcome-message">
                        안녕하세요, <strong>{user?.username}</strong>님!
                      </p>
                      <Link to={ROUTES.CHAT}>
                        <Button size="large" icon={<ArrowRight />}>
                          채팅 시작하기
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="auth-actions">
                      <Link to={ROUTES.REGISTER}>
                        <Button size="large">
                          시작하기
                        </Button>
                      </Link>
                      <Link to={ROUTES.LOGIN}>
                        <Button variant="outline" size="large">
                          로그인
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
                    <p>안녕하세요! 서울과학기술대학교 AI입니다.</p>
                  </div>
                  <div className="chat-bubble user">
                    <p>학교 생활에 대해 궁금한 게 있어요!</p>
                  </div>
                  <div className="chat-bubble bot">
                    <p>무엇이든 물어보세요! 도움을 드릴게요.</p>
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
              <h2>주요 기능</h2>
              <p>SeoulTech Chat이 제공하는 특별한 기능들을 만나보세요.</p>
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
              <h2>지금 바로 시작해보세요!</h2>
              <p>서울과학기술대학교 학생들을 위한 특별한 AI 채팅 경험</p>
              
              {!isAuthenticated && (
                <div className="cta-actions">
                  <Link to={ROUTES.REGISTER}>
                    <Button size="large">
                      무료로 시작하기
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