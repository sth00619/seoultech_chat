const jwt = require('jsonwebtoken');

class JwtModule {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-seoultech-chat';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.tokenExpiry = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * 액세스 토큰 생성
   * @param {Object} payload - 토큰에 포함될 데이터
   */
  createToken(payload) {
    return jwt.sign(
      payload, 
      this.accessTokenSecret, 
      {
        expiresIn: this.tokenExpiry,
        algorithm: 'HS256'
      }
    );
  }

  /**
   * 리프레시 토큰 생성
   * @param {Object} payload - 토큰에 포함될 데이터
   */
  createRefreshToken(payload) {
    return jwt.sign(
      payload,
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        algorithm: 'HS256'
      }
    );
  }

  /**
   * 토큰 검증
   * @param {String} token - 검증할 토큰
   * @param {Boolean} isRefreshToken - 리프레시 토큰 여부
   */
  verifyToken(token, isRefreshToken = false) {
    try {
      const secret = isRefreshToken ? this.refreshTokenSecret : this.accessTokenSecret;
      return jwt.verify(token, secret);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 토큰 갱신
   * @param {String} refreshToken - 리프레시 토큰
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken, true);
      
      const newAccessToken = this.createToken({
        userId: decoded.userId,
        email: decoded.email
      });
      
      const newRefreshToken = this.createRefreshToken({
        userId: decoded.userId
      });
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new JwtModule();
    }
    return this.instance;
  }
}

module.exports = JwtModule.getInstance();