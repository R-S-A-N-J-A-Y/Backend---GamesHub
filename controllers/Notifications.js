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

const getAllNotification = async () => {
  try {
    const data = await NotficationModel.find().select(
      "-userId -__v -createdAt"
    );
    return {
      success: true,
      code: 200,
      data: data,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      code: 500,
      message: "Unable to fetch the Notifications...",
    };
  }
};

const createNotification = async (data) => {
  const { error } = Validate(data);
  console.log(error);
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
  getAllNotification,
  createNotificationData,
};
