const express = require("express");
const router = express.Router();
const {
  createNotification,
  getMyNotifications,
  seenAllNotifications,
} = require("../controllers/notification.controller");

router.post("/create", createNotification);
router.get("/my-notifications/:userId", getMyNotifications);
router.post("/seen-all/:userId", seenAllNotifications);

module.exports = router;
