const { Schema, default: mongoose } = require("mongoose");
const { Notification_Constants } = require("../consts/notification.constant");

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" }, // user who will receive the notification
    from: { type: Schema.Types.ObjectId, ref: "User" }, // user who sent the notification
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Notification_Constants.Notification_Types_Enum,
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId, // post id
      required: true,
    },
    targetType: {
      type: String,
      enum: Notification_Constants.Notification_Target_Types_Enum,
      required: true,
    },
    isSeen: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    timeseries: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
