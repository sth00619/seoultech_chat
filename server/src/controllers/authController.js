const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userDao = require('../dao/userDao');
const jwtModule = require('../modules/JwtModule');

// JWT 토큰 생성 함수
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

class AuthController {
  // 로그인
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt:', { email });

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      const user = await userDao.getUserByEmail(email);
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      let isValidPassword = false;
      
      if (user.password) {
        try {
          isValidPassword = await bcrypt.compare(password, user.password);
          console.log('Bcrypt comparison result:', isValidPassword);
        } catch (err) {
          console.log('Trying plain text comparison');
          isValidPassword = (password === user.password);
          
          if (isValidPassword) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await userDao.updatePassword(user.id, hashedPassword);
            console.log('Password upgraded to hash for user:', email);
          }
        }
      }
      
      if (!isValidPassword) {
        console.log('Password mismatch');
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // JWT 토큰 생성 - JwtModule 사용
      const tokenPayload = {
        userId: user.id,
        email: user.email
      };
      
      const accessToken = jwtModule.createToken(tokenPayload);
      const refreshToken = jwtModule.createRefreshToken({ userId: user.id });

      const { password: userPassword, ...userWithoutPassword } = user;
      
      console.log('Login successful for:', userWithoutPassword.email);
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token: accessToken,
        refreshToken
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 회원가입
  async register(req, res) {
    try {
      const { email, username, password } = req.body;

      console.log('Register called:', { email, username });

      if (!email || !username || !password) {
        return res.status(400).json({ 
          error: 'Email, username, and password are required' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters long' 
        });
      }

      const existingUser = await userDao.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Email already exists' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed');

      const userId = await userDao.createUser({ 
        email, 
        username, 
        password_hash: hashedPassword
      });

      console.log('User created with ID:', userId);

      // JWT 토큰 생성
      const tokenPayload = {
        userId: userId,
        email: email
      };
      
      const accessToken = jwtModule.createToken(tokenPayload);
      const refreshToken = jwtModule.createRefreshToken({ userId });

      res.status(201).json({ 
        id: userId, 
        message: 'User created successfully',
        token: accessToken,
        refreshToken,
        user: {
          id: userId,
          email,
          username
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 토큰 갱신
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const tokens = await jwtModule.refreshToken(refreshToken);
      
      res.json({
        message: 'Token refreshed successfully',
        ...tokens
      });
      
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  // 현재 사용자 정보 조회
  async getCurrentUser(req, res) {
    try {
      const { userId } = req; // authMiddleware에서 설정됨
      
      const user = await userDao.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password, password_hash, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
      
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();