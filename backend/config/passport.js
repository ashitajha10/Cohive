const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://cohive-extf.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        });

        if (!user) {
          const baseUsername = profile.emails[0].value.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            displayName: profile.displayName,
            username: `${baseUsername}${randomSuffix}`,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            authProvider: 'google'
          });
        } else if (!user.googleId) {
          // Link Google ID to existing local account
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = profile.photos[0].value;
          user.authProvider = 'google'; // Mark as linked to Google
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;