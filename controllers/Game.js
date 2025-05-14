const { GameModel, Validate } = require("../models/GameModels");

exports.getAll = async () => {
  try {
    const result = await GameModel.find();
    return { success: true, data: result };
  } catch (err) {
    return { success: true, message: err };
  }
};
