const express = require('express');
const router = express();
const passport = require('passport');

const {
	userSignUpRules,
	userSignUp,
	userLogin,
	userLoginRules,
	userLogout,
	verifyEmail,
	forgetPasswordRules,
	forgotPassword,
	resetPasswordRules,
	resetPassword,
	refreshToken,
    verifyAuth,
} = require('../controllers/auth');
const user = require('../models/user');

// Tokens
router.get('/csrf-token', (req, res) => {
	const csrfToken = req.session.csrfToken;
	res.json({csrfToken});
});
router.get('/verify', verifyAuth, (req, res) => {
    res.json(req.user);
});
router.post('/refresh-token', refreshToken);

// User Routes
router.post('/register', userSignUpRules, userSignUp);
router.post(
	'/login',

	userLoginRules,
    // passport.authenticate('local', (err, user, info) => {
    //     if (err) {
    //       console.log('Authentication error:', err);
    //       return next(err);
    //     }
    //     if (!user) {
    //       console.log('Authentication failed:', info.message);
    //       return res.status(401).json({ message: info.message });
    //     }
    //     req.logIn(user, (err) => {
    //       if (err) {
    //         console.log('Login error:', err);
    //         return next(err);
    //       }
    //       console.log('Login successful:', user);
    //       return res.json({ message: 'Login successful' });
    //     });
    //   })(req, res, next),
	userLogin,

);
router.post('/logout', userLogout);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgetPasswordRules, forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, resetPassword);

// OAuth Routes
router.get(
	'/google',
	passport.authenticate('google', {scope: ['profile', 'email']})
);
router.get(
	'/google/callback',
	passport.authenticate('google', {failureRedirect: '/'}),
	(req, res) => {
		userLogin(req, res);
	}
);

router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));
router.get(
	'/facebook/callback',
	passport.authenticate('facebook', {failureRedirect: '/'}),
	(req, res) => {
		userLogin(req, res);
	}
);

module.exports = router;
