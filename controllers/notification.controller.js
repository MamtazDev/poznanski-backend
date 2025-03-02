const { Notification_Constants } = require("../consts/notification.constant");
const Album = require("../models/album");
const Material = require("../models/material");
const news = require("../models/news");
const Notification = require("../models/notification");
const TvAndRadio = require("../models/tvAndRadio");
const user = require("../models/user");
const { NotificationEvents } = require("../socket/socketEvent");
const { SSE } = require("../sse/sseServer");

const createNotification = async (req, res) => {
  try {
    const { title, receiverId, type } = req.body;
    // Check if the type is valid by Notification_Types_List
    if (!Notification_Constants.Notification_Types_List.includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    // check title
    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    // Check if the user exists
    const userInfo = await user.findById(receiverId).select("_id");
    if (!userInfo) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const notification = new Notification({
      title,
      user: receiverId,
      type,
    });

    const result = await notification.save();
    await SSE.sendMessage(
      receiverId,
      JSON.stringify({
        type: "notification",
        data: result,
      })
    );
    res.status(201).json({ success: true, message: "Notification created" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Notification created unsuccessfully",
      error: error.message,
    });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalCount = await Notification.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalCount / limit);

    const notifications = await Notification.find({ user: userId })
      .sort({
        _id: -1,
      })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "from",
        select: "nickname",
      })
      .then(async (notifications) => {
        const updatedNotifications = await Promise.all(
          notifications.map(async (notification) => {
            let result = null;
            if (
              notification.targetType ===
              Notification_Constants.Notification_Target_Types.News
            ) {
              result = await news
                .findById(notification.targetId)
                .select("title");
            } else if (
              notification.targetType ===
              Notification_Constants.Notification_Target_Types.Material
            ) {
              result = await Material.findById(notification.targetId).select(
                "title"
              );
            } else if (
              notification.targetType ===
              Notification_Constants.Notification_Target_Types.Album
            ) {
              result = await Album.findById(notification.targetId).select(
                "title"
              );
            } else if (
              notification.targetType ===
              Notification_Constants.Notification_Target_Types.Radio
            ) {
              result = await TvAndRadio.findById(notification.targetId).select(
                "title"
              );
            }

            return {
              ...notification.toObject(),
              post: result,
            };
          })
        );
        return updatedNotifications;
      });

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Notification retrieved unsuccessfully",
      error: error.message,
    });
  }
};

// seen all notifications
const seenAllNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    await Notification.updateMany(
      { user: userId },
      {
        $set: { isSeen: true },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications seen successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to see all notifications",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  seenAllNotifications,
};
