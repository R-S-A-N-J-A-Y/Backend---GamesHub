const {
  PlatformVersionModel,
  Validate,
} = require("../../models/PlatformVersionModel");
const Platform = require("./Platform");

// get all the platforms
exports.getAll = async (id) => {
  const offset = id * 20;
  const limit = 20;
  try {
    let data = await PlatformVersionModel.find().skip(offset).limit(limit);
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};
