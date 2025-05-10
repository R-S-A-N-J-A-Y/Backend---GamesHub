const { PlatformModel, Validate } = require("../../models/PlatformModel");

exports.getAll = async (id) => {
  const offset = id * 20;
  const limit = 20;
  try {
    let data = await PlatformModel.find().skip(offset).limit(limit);
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};
