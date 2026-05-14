const express = require('express');
const passport = require('passport');
const { register, login, googleCallback, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { validateRegistration, validateLogin, validateResetPassword } = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  googleCallback
);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

module.exports = router;