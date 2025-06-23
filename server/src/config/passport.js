const passport = require('passport');
const NaverStrategy = require('passport-naver-v2').Strategy;
const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');

const initializePassport = () => {
  // 세션에 사용자 ID 저장
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // 세션에서 사용자 정보 복원
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userDao.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // 네이버 OAuth 전략 설정
  passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: process.env.NAVER_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Naver OAuth Profile:', profile);
      
      const email = profile.email || `${profile.id}@naver.oauth`;
      const username = profile.displayName || profile.nickname || `네이버사용자_${profile.id.substring(0, 8)}`;
      
      // 기존 사용자 확인
      let user = await userDao.getUserByEmail(email);
      
      if (!user) {
        // 네이버 OAuth 사용자는 랜덤 비밀번호 생성 (직접 로그인 불가)
        const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
        
        // 새 사용자 생성
        const userId = await userDao.createUser({
          email: email,
          username: username,
          password_hash: randomPassword,
          oauth_provider: 'naver',
          oauth_id: profile.id
        });
        
        user = await userDao.getUserById(userId);
      } else {
        // 기존 사용자가 있고 OAuth 정보가 없다면 업데이트
        if (!user.oauth_provider) {
          await userDao.updateOAuthInfo(user.id, 'naver', profile.id);
        }
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Naver OAuth Error:', error);
      return done(error, null);
    }
  }));
};

module.exports = initializePassport;