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

      // 평문 비밀번호 비교 - password 컬럼 사용
      if (password !== user.password) {
        console.log('Password mismatch');
        console.log('Expected:', user.password);
        console.log('Received:', password);
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // 로그인 성공
      const { password: userPassword, ...userWithoutPassword } = user;
      
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
      const { email, username, password } = req.body;

      // 입력 검증
      if (!email || !username || !password) {
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
        password_hash: password // password_hash로 전달하지만 DAO에서 password 컬럼에 저장
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