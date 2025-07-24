const { Validate, NotficationModel } = require("../models/NotficationModel");

const createNotificationData = (userId, gameId, type, name) => {
  if (type === "NEW_GAME")
    return {
      userId,
      gamesId: gameId.toString(),
      type,
      title: "New Game Released!",
      message: `Check out the newly launched game: ${name}.`,
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
