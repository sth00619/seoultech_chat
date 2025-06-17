const pool = require('../../config/database');
const userDao = require('../userDao');

jest.mock('../../config/database');

describe('UserDao', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('이메일로 사용자를 찾아야 함', async () => {
      const mockUser = {
        id: 1,
        email: 'test@seoultech.ac.kr',
        username: 'testuser'
      };

      pool.query.mockResolvedValue([[mockUser]]);

      const result = await userDao.getUserByEmail('test@seoultech.ac.kr');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@seoultech.ac.kr']
      );
      expect(result).toEqual(mockUser);
    });

    it('사용자가 없을 때 undefined 반환', async () => {
      pool.query.mockResolvedValue([[]]);

      const result = await userDao.getUserByEmail('notfound@seoultech.ac.kr');

      expect(result).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('새 사용자를 생성해야 함', async () => {
      pool.query.mockResolvedValue([{ insertId: 1 }]);

      const userData = {
        email: 'new@seoultech.ac.kr',
        username: 'newuser',
        password_hash: 'hashedPassword'
      };

      const result = await userDao.createUser(userData);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
        ['new@seoultech.ac.kr', 'newuser', 'hashedPassword']
      );
      expect(result).toBe(1);
    });
  });
});