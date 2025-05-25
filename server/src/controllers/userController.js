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

  // 새 사용자 생성
  async createUser(req, res) {
    try {
      const { email, username, password } = req.body;
      
      // 이메일 중복 체크
      const existingUser = await userDao.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const userId = await userDao.createUser({ 
        email, 
        username, 
        password_hash: password // password_hash 컬럼에 평문 비밀번호 저장
      });
      res.status(201).json({ id: userId, message: 'User created successfully' });
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