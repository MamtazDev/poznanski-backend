const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const passport = require("passport");
const { check, validationResult } = require("express-validator");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
// const sendEmail = require("../utils/email");
const crypto = require("crypto");
const EmailService = require("../utils/emailService");
const { createAccount } = require("../utils/EmailTemplate/CreateAccount");
const sendEmail = require("../utils/email");
require("dotenv").config();

const emailService = new EmailService(); // Create an instance

const userSignUpRules = [
  check("nickname").not().isEmpty().withMessage("Nickname is required"),
  check("email").isEmail().withMessage("Please include a valid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const userLoginRules = [
  check("email").isEmail().withMessage("Please include a valid email"),
  check("password").exists().withMessage("Password is required"),
];

const forgetPasswordRules = [
  check("email").isEmail().withMessage("Please include a valid email"),
];

const resetPasswordRules = [
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const verifyAuthToken = (token) => {
  try {
    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // This will contain the user information
  } catch (error) {
    throw new Error("Invalid token");
  }
};

const verifyAuth = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = verifyAuthToken(token); // Verify the token and get user data
    req.user = user; // Attach user information to the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    req.logOut();
    return res
      .status(401)
      .json({ message: "Twój token wygasł. Zaloguj się, aby kontynuować." });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    console.log(user, payload);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken(user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.json({ accessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

const userSignUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });
  }
  const { nickname, email, password, role } = req.body;

  try {
    let user = await User.findOne({ $or: [{ email }, { nickname }] });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Taki użytkownik już istnieje" });
    }

    user = new User({ nickname, email, password, role: "user" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    const verificationToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;

    await user.save();
    await sendEmail(
      user.email,
      "POZNANSKIRAP.COM - weryfikacja adresu email",
      "Thank you for creating listing with POZNANSKIRAP.COM",
      createAccount(user.email, verificationUrl)

      // "POZNANSKIRAP.COM - weryfikacja adresu email",
      // `Siema! Proszę zweryfikuj swój email na portalu poznanskirap.com klikając w link: ${verificationUrl}`
    );

    // await emailService.sendEmail({
    //   to: user.email,
    //   subject: `Your listing is now`,
    //   text: 'Thank you for creating listing with Book The Party',
    //   // html: `Siema! Proszę zweryfikuj swój email na portalu poznanskirap.com klikając w link: ${verificationUrl}`
    //   html: createAccount(user.email, verificationUrl,)
    // })

    res.status(201).json({
      success: true,
      verificationToken: verificationToken,
      message:
        "User registered. Please check your email for verification link.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const userLogin = async (req, res, next) => {
  // Add 'next' parameter
  passport.authenticate("local", async (err, user, info) => {
    try {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (!user) {
        return res
          .status(401)
          .json({ message: info?.message || "Invalid credentials" });
      }

      if (!user.isVerified) {
        return res
          .status(403)
          .json({ message: "User needs to verify their account first" });
      }

      req.logIn(user, async (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        try {
          const accessToken = generateAccessToken(user);
          const refreshToken = generateRefreshToken(user);

          await User.updateOne({ _id: user._id }, { refreshToken });

          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            maxAge: 3600000, // Cookie expiration time
          });
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
          });

          return res.json({
            user,
            message: "Logged in successfully",
            accessToken: accessToken,
          });
        } catch (tokenError) {
          console.error("Token error:", tokenError);
          return res.status(500).json({ message: "Error generating tokens" });
        }
      });
    } catch (outerError) {
      console.error("Outer error:", outerError);
      next(outerError); // Pass errors to Express error handler
    }
  })(req, res, next); // Pass 'next' to passport.authenticate
};

const userLogout = async (req, res) => {
  console.log("Entering userLogout function");

  if (!req.user) {
    console.error("User not authenticated");
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    console.log("Updating user in database");
    await User.updateOne({ _id: req.user._id }, { refreshToken: null });
    console.log("User updated in database");

    // Check for the correct logout method
    if (typeof req.logout === "function") {
      req.logout((err) => {
        if (err) {
          console.error("Error during logout:", err);
          return res.status(500).json({ message: "Error logging out" });
        }

        console.log("Clearing cookies");
        res.clearCookie("accessToken");
        res.clearCookie("access_token");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
      });
    } else if (typeof req.logOut === "function") {
      req.logOut((err) => {
        if (err) {
          console.error("Error during logOut:", err);
          return res.status(500).json({ message: "Error logging out" });
        }

        console.log("Clearing cookies");
        res.clearCookie("access_token");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
      });
    } else {
      console.error("Logout method not found on req");
      res.status(500).json({ message: "Logout method not available" });
    }
  } catch (err) {
    console.error("Error in userLogout:", err);
    res.status(500).json({ message: "Error logging out", error: err });
  }
};

const verifyEmail = async (req, res) => {
  // const {token} = req
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    console.log("user", user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Nie ma takiego użytkownika" });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "To konto jest już zweryfikowane" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Konto zweryfikowane pomyślnie, teraz możesz się zalogować",
      user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({
      success: false,
      message: "Invalid token",
      errors: [{ msg: "Invalid token" }],
    });
  }
};

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "User not found" }] });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // await sendEmail(
    //   user.email,
    //   "Password Reset",
    //   `Please reset your password by clicking this link: ${resetUrl}`
    // );

    await user.save();

    res.status(200).json({ resetToken, message: "Password reset email sent." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid or expired token" }] });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json(users); // Send the list of users as a JSON response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editUser = async (req, res) => {
  const userId = req.params.id; // Extract user ID from request parameters
  const updatedData = req.body; // Extract data to update from request body
  console.log("updatedData", updatedData, userId);

  try {
    // Find the user by ID and update with new data
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validations are run on the updated data
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" }); // User not found
    }

    res.status(200).json(updatedUser); // Send the updated user data as a JSON response
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  try {
    // Find the user by ID and update with new data
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validations are run on the updated data
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" }); // User not found
    }

    res.status(200).json(updatedUser); // Send the updated user data as a JSON response
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  verifyAuth,
  refreshToken,
  resetPassword,
  forgotPassword,
  verifyEmail,
  userSignUp,
  userLogin,
  userLogout,
  userSignUpRules,
  userLoginRules,
  forgetPasswordRules,
  resetPasswordRules,
  getUsers,
  editUser,
};
