const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

exports.validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' });
  }

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  next();
};

exports.validateResetPassword = (req, res, next) => {
  const { password, token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Reset token is required' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  next();
};
