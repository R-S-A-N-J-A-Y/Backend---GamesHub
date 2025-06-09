const { PlatformModel, Validate } = require("../models/PlatformModel");

// READ OPERATION

// get all the platforms
exports.getById = async (id) => {
  try {
    let data = await PlatformModel.findOne({ _id: id });
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};

exports.getAll = async (pageNumber = 0, limit = 0) => {
  const offset = pageNumber * limit;
  try {
    let data = await PlatformModel.find()
      .skip(offset)
      .limit(limit)
      .select("-__v");
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

// get the Ids of platform by name
exports.getIds = async (platformNameArr) => {
  try {
    const result = await PlatformModel.find({
      name: { $in: platformNameArr },
    }).select("_id");
    if (!result || result.length === 0)
      return { success: false, statusCode: 400, message: "No platform found." };
    const PlatformIds = result.map((obj) => obj._id);
    return { success: true, statusCode: 200, data: PlatformIds };
  } catch (err) {
    return { success: false, statusCode: 500, message: "Backend is Dead..." };
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
