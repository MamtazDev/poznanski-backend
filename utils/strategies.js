const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: '/api/auth/google/callback',
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ googleId: profile.id });
//     if (!user) {
//       user = await User.create({ googleId: profile.id, email: profile.emails[0].value, name: profile.displayName });
//     }
//     done(null, user);
//   } catch (err) {
//     done(err, false);
//   }
// }));

// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: '/api/auth/facebook/callback',
//   profileFields: ['id', 'emails', 'name'],
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ facebookId: profile.id });
//     if (!user) {
//       user = await User.create({ facebookId: profile.id, email: profile.emails[0].value, name: profile.name.givenName });
//     }
//     done(null, user);
//   } catch (err) {
//     done(err, false);
//   }
// }));

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async (email, password, done) => {
    console.log('passport.use', email, password)
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

module.exports = passport;