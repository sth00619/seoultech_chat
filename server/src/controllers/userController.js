const bcrypt = require('bcryptjs');
const userDao = require('../dao/userDao');

class UserController {
  // 모든 사용자 조회
  async getAllUsers(req, res) {
    try {
      const users = await userDao.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 특정 사용자 조회
  async getUserById(req, res) {
    try {
      const user = await userDao.getUserById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 새 사용자 생성 - bcrypt 해싱 추가
  async createUser(req, res) {
    try {
      const { email, username, password } = req.body;
      
      // 입력 검증
      if (!email || !username || !password) {
        return res.status(400).json({ 
          error: 'Email, username, and password are required' 
        });
      }

      // 비밀번호 강도 검증
      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters long' 
        });
      }

      // 이메일 중복 체크
      const existingUser = await userDao.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // 비밀번호 해싱
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 사용자 생성
      const userId = await userDao.createUser({ 
        email, 
        username, 
        password_hash: hashedPassword // 해시된 비밀번호 전달
      });

      res.status(201).json({ 
        id: userId, 
        message: 'User created successfully' 
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 사용자 정보 업데이트
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, email } = req.body;
      console.log(id);
      console.log(req.params);
      const affectedRows = await userDao.updateUser(id, { username, email });
      
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 사용자 삭제
  async deleteUser(req, res) {
    try {
      const affectedRows = await userDao.deleteUser(req.params.id);
      
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();