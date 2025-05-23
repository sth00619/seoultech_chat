const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Database connection failed',
      message: 'Unable to connect to the database'
    });
  }

  if (err.code && err.code.startsWith('ER_')) {
    return res.status(400).json({
      error: 'Database error',
      message: err.message
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler;