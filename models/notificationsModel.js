const mongoose = require("mongoose");

//Defining post schema
const notificationSchema = new mongoose.Schema(
  {
    userTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notificationType: String,
    opened: { type: Boolean, default: false },
    entityId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

// static method to insert notifications from any page
notificationSchema.statics.insertNotification = async (
  userTo,
  userFrom,
  notificationType,
  entityId
) => {
  try {
    const data = {
      userTo: userTo,
      userFrom: userFrom,
      notificationType: notificationType,
      entityId: entityId,
    };

    await Notification.deleteOne(data);
    return Notification.create(data);
  } catch (err) {
    console.log(err);
  }
};

//Post Model
const Notification = new mongoose.model("Notification", notificationSchema);

module.exports = Notification;
