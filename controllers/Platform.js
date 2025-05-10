const { PlatformModel, Validate } = require("../models/PlatformModel");

// READ OPERATION

// get all the platforms
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

exports.getId = async (platformName) => {
  try {
    const data = await PlatformModel.find({ name: platformName });
    if (data.length === 0)
      return {
        success: false,
        code: 409,
        message: "Specified platform is not in database.",
      };
    return { success: true, id: data[0]._id };
  } catch (err) {
    return { success: false, code: 400, message: err };
  }
};

// WRITE OOPERATION

// Add new Platform details to Db
exports.addPlatform = async (data) => {
  const { error } = Validate(data);
  if (error)
    return {
      success: false,
      code: 400,
      message: error.details.map((d) => d.message).join(", "),
    };

  try {
    const NewPlatform = new PlatformModel(data);
    await NewPlatform.save();
    return { success: true, data: NewPlatform };
  } catch (err) {
    let message = "";
    if (err.code === 11000) message = "Specified Platform is Already exist.";
    else message = `${err.code} ${err.errmsg}`;
    return { success: false, code: 409, message: message };
  }
};
