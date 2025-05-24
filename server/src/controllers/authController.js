const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userDao = require('../dao/userDao');

class AuthController {
  // 로그인
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // 입력 검증
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      // 사용자 조회
      const user = await userDao.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // 비밀번호 확인
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // 응답 (비밀번호 제외)
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 회원가입 (기존 userController에서 이동)
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

  // 토큰 검증
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await userDao.getUserById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({
        valid: true,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}

module.exports = new AuthController();