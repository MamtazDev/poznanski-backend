const express = require("express");
const router = express();
const passport = require("passport");

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
  getUsers,
  editUser,
  deleteUser,
} = require("../controllers/auth");
const user = require("../models/user");

// Tokens
router.get("/csrf-token", (req, res) => {
  const csrfToken = req.session.csrfToken;
  res.json({ csrfToken });
});
router.get("/verify", verifyAuth, (req, res) => {
  res.json(req.user);
});
router.post("/refresh-token", refreshToken);
router.get("/users", getUsers);
router.get("/users", getUsers);
router.put("/users/:id", editUser);
router.delete("/users/:id", deleteUser);

// User Routes
router.post("/register", userSignUpRules, userSignUp);
router.post(
  "/login",
  userLoginRules,
  userLogin
);
router.post("/logout", userLogout);
router.post("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgetPasswordRules, forgotPassword);
router.post("/reset-password/:token", resetPasswordRules, resetPassword);

// OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    userLogin(req, res);
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    userLogin(req, res);
  }
);


module.exports = router;
