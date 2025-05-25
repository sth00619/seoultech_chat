const userDao = require('../dao/userDao');

class AuthController {
  // 간단한 로그인 (평문 비밀번호)
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt:', { email, password });

      // 입력 검증
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      // 사용자 조회
      const user = await userDao.getUserByEmail(email);
      console.log('User found:', user);
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // 평문 비밀번호 비교
      if (password !== user.password_hash) {
        console.log('Password mismatch');
        console.log('Expected:', user.password_hash);
        console.log('Received:', password);
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // 로그인 성공
      const { password_hash, ...userWithoutPassword } = user;
      
      console.log('Login successful for:', userWithoutPassword.email);
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 회원가입 (평문 비밀번호)
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

      // 사용자 생성 (평문 비밀번호 그대로 저장)
      const userId = await userDao.createUser({ 
        email, 
        username, 
        password_hash: password_hash // 평문 그대로 저장
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
}

module.exports = new AuthController();