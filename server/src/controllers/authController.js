const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userDao = require('../dao/userDao');

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
      
      // password 컬럼에 저장된 값 확인
      if (user.password) {
        try {
          // 먼저 bcrypt 해시로 비교 시도
          isValidPassword = await bcrypt.compare(password, user.password);
          console.log('Bcrypt comparison result:', isValidPassword);
        } catch (err) {
          // bcrypt 비교 실패시 평문 비교
          console.log('Trying plain text comparison');
          isValidPassword = (password === user.password);
          
          // 평문 비밀번호가 맞다면 해시로 업그레이드
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

      // JWT 토큰 생성
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-seoultech-chat',
        { 
          expiresIn: '24h'
        }
      );

      const { password: userPassword, ...userWithoutPassword } = user;
      
      console.log('Login successful for:', userWithoutPassword.email);
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
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
      const token = jwt.sign(
        { 
          userId: userId, 
          email: email 
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-seoultech-chat',
        { 
          expiresIn: '24h'
        }
      );

      res.status(201).json({ 
        id: userId, 
        message: 'User created successfully',
        token,
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
}

module.exports = new AuthController();