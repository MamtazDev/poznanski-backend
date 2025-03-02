const { getIo, getSocketUser } = require("./socketServer");

const sendNotification = async (receiverId, notificationData) => {
  const user = await getSocketUser(receiverId);
  if (user) {
    getIo().to(user.socketId).emit("notification", notificationData);
  }

  return {
    success: true,
    message: "Notification sent",
    data: {
      socket: user,
    },
  };
};

module.exports = {
  NotificationEvents: {
    sendNotification,
  },
};
