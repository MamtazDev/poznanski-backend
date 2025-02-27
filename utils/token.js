const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, nickname: user.nickname, profilePicture: user.profilePicture ?? null }, process.env.JWT_SECRET, { expiresIn: '150m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

module.exports = { generateAccessToken, generateRefreshToken };