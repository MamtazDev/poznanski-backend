const { Notification_Constants } = require("../consts/notification.constant");
const Notification = require("../models/notification");
const User = require("../models/user");
const { SSE } = require("../sse/sseServer");

const makeNotification = async (
  title,
  receiverId,
  fromId,
  type,
  targetId,
  targetType
) => {
  try {
    if (!Notification_Constants.Notification_Types_List.includes(type)) {
      return { success: false, message: "Invalid type" };
    }

    if (
      !Notification_Constants.Notification_Target_Types_Enum.includes(
        targetType
      )
    ) {
      return { success: false, message: "Invalid target type" };
    }

    if (!targetId) {
      return { success: false, message: "Target ID is required" };
    }

    // check title
    if (!title) {
      return { success: false, message: "Title is required" };
    }

    if (!fromId) {
      return { success: false, message: "Sender id is required" };
    }

    // Check if the user exists
    const userInfo = await User.findById({ _id: receiverId }).select("_id");
    if (!userInfo) {
      return { success: false, message: "User not found" };
    }

    const notification = new Notification({
      title,
      user: receiverId,
      from: fromId,
      type,
      targetId,
      targetType,
    });

    const result = await notification.save();
    await SSE.sendMessage(
      receiverId,
      JSON.stringify({
        type: "notification",
        data: result,
      })
    );
    return { success: true, message: "Notification created" };
  } catch (error) {
    return {
      success: false,
      message: "Notification created unsuccessfully",
      error: error.message,
    };
  }
};

module.exports = {
  makeNotification,
};
