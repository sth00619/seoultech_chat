const bcrypt = require('bcryptjs');
const userDao = require('../dao/userDao');

class AuthController {
  // 간단한 로그인 (JWT 없이)
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt:', { email, password }); // 디버깅용

      // 입력 검증
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      // 사용자 조회
      const user = await userDao.getUserByEmail(email);
      console.log('User found:', user ? { id: user.id, email: user.email } : 'Not found'); // 디버깅용
      
      if (!user) {
        console.log('User not found in database');
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // 비밀번호 확인
      console.log('Comparing passwords...');
      console.log('Input password:', password);
      console.log('Stored hash:', user.password_hash);
      
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password comparison result:', isValidPassword); // 디버깅용
      
      if (!isValidPassword) {
        console.log('Password comparison failed');
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // 응답 (비밀번호 제외, JWT 토큰 없이)
      const { password_hash, ...userWithoutPassword } = user;
      
      console.log('Login successful for user:', userWithoutPassword.email);
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 회원가입
  async register(req, res) {
    try {
      const { email, username, password_hash } = req.body;

      // 입력 검증
      if (!email || !username || !password_hash) {
        return res.status(400).json({ 
          error: 'Email, username, and password are required' 
        });
      }

      // 이메일 중복 체크
      const existingUser = await userDao.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Email already exists' 
        });
      }

      // 비밀번호 해싱
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password_hash, saltRounds);

      // 사용자 생성
      const userId = await userDao.createUser({ 
        email, 
        username, 
        password_hash: hashedPassword 
      });

      res.status(201).json({ 
        id: userId, 
        message: 'User created successfully' 
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 비밀번호 테스트용 메서드 (개발용)
  async testPassword(req, res) {
    try {
      const { password } = req.body;
      const testHash = '$2b$10$CwTycUXWue0Thq9StjUM0uJ4/WMhOyMRz2H7xk6LV8QXxYKJFuYlO';
      
      console.log('Testing password:', password);
      console.log('Against hash:', testHash);
      
      const result = await bcrypt.compare(password, testHash);
      console.log('Test result:', result);
      
      res.json({ 
        password, 
        hash: testHash, 
        match: result 
      });
    } catch (error) {
      console.error('Password test error:', error);
      res.status(500).json({ error: 'Test failed' });
    }
  }
}

module.exports = new AuthController();