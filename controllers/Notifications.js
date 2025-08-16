const { Validate, NotficationModel } = require("../models/NotficationModel");

const createNotificationData = (userId, gameId, type, name, discount) => {
  if (type === "NEW_GAME")
    return {
      userId,
      gamesId: gameId.toString(),
      type,
      title: "New Game Released!",
      message: `Check out the newly launched game: ${name}.`,
      actionUrl: `/games/${gameId}`,
    };
  else if (type === "GAME_DISCOUNT")
    return {
      userId,
      gamesId: gameId.toString(),
      type,
      title: "Limited Time Discount!",
      message: ` ${name} is now available at ${discount} off. Grab it before the offer ends!`,
      actionUrl: `/games/${gameId}`,
    };
  else if (type === "GAME_UPDATE")
    return {
      userId,
      gamesId: gameId.toString(),
      type,
      title: `What’s New in ${name}`,
      message: `New features and updates have been added to ${name}. Check them out now!`,
      actionUrl: `/games/${gameId}`,
    };
};

const getAllNotification = async (userId) => {
  try {
    const notfications = await NotficationModel.find().select(
      "-userId -__v -createdAt"
    );
    const data = notfications.map((notify) => ({
      ...notify._doc,
      isRead: notify.isRead.includes(userId),
    }));

    return {
      success: true,
      code: 200,
      data: data,
    };
  } catch (err) {
    return {
      success: false,
      code: 500,
      message: "Unable to fetch the Notifications...",
    };
  }
};

const getUnReadCnt = async (userId) => {
  try {
    const data = await NotficationModel.countDocuments({
      isRead: { $nin: userId },
    });
    return {
      success: true,
      code: 200,
      data: data,
    };
  } catch (err) {
    return {
      success: false,
      code: 500,
      message: "Unable to fetch the Notifications...",
    };
  }
};

const getNotification = async (notificationId, userId) => {
  try {
    const notification = await NotficationModel.findOne({
      _id: notificationId,
    });
    if (!notification) {
      return {
        success: false,
        code: 404,
        message: "Notification not found.",
      };
    }
    if (!notification.isRead.includes(userId)) {
      notification.isRead.push(userId);
      notification.save().catch((err) => {
        console.error("Failed to update isRead list:", err);
      });
    }
    return { success: true, code: 200, data: notification.actionUrl };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      code: 500,
      message: "Cannot able to find the Notification.",
    };
  }
};

const createNotification = async (data) => {
  const { error } = Validate(data);
  if (error) return { success: false, code: 400, message: error };

  try {
    await NotficationModel.create(data);
    return {
      success: true,
      code: 201,
      message: "Successfully Create an Notifications",
    };
  } catch (err) {
    return {
      success: false,
      code: 500,
      message: "Unable to create an Notifications...",
    };
  }
};

module.exports = {
  createNotification,
  getUnReadCnt,
  getAllNotification,
  getNotification,
  createNotificationData,
};
