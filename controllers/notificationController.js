const Notification = require("./../models/notificationsModel");

exports.getAllNotifications = async (req, res, next) => {
  //gettting all the notification except the new Message notification

  const searchObj = {
    userTo: req.session.user._id,
    notificationType: { $ne: "newMessage" },
  };
  if (req.query.unreadOnly === "true") {
    searchObj.opened = false;
  }

  const notifications = await Notification.find(searchObj)
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    notifications,
  });
};

//marking notification as opened
exports.markNotificationAsOpened = async (req, res, next) => {
  await Notification.findByIdAndUpdate(req.params.id, { opened: true });
  res.status(200).json({
    status: "success",
  });
};

//marking notification as opened
exports.markAllNotificationAsOpened = async (req, res, next) => {
  await Notification.updateMany(
    { userTo: req.session.user._id },
    { opened: true }
  );
  res.status(200).json({
    status: "success",
  });
};

// getting latest notification
exports.getLatestNotification = async (req, res, next) => {
  const notification = await Notification.findOne({
    userTo: req.session.user._id,
  })
    .populate("userTo")
    .populate("userFrom")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    notification,
  });
};
