const jwtModule = require('../modules/JwtModule');

const authMiddleware = (req, res, next) => {
  try {
    console.log('[AuthMiddleware] Headers:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      // JwtModule을 사용한 토큰 검증
      const decoded = jwtModule.verifyToken(token);
      
      console.log('[AuthMiddleware] Token verified:', decoded);
      
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      
      next();
    } catch (tokenError) {
      console.error('[AuthMiddleware] Token error:', tokenError.message);
      
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authMiddleware;