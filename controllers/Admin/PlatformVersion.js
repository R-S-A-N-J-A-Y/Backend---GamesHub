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

// Add new Platform details to Db
exports.addPlatform = async (data) => {
  // Validating the User data
  const { error } = Validate(data);
  if (error)
    return {
      success: false,
      code: 400,
      message: error.details.map((d) => d.message).join(", "),
    };

  //getting the id Of platform
  const result = await Platform.getId(data.parentPlatform);
  if (!result.success) return result;

  const NewData = { ...data, parentPlatform: result.id };
  try {
    const NewPlatform = new PlatformVersionModel(NewData);
    await NewPlatform.save();
    return { success: true, data: NewPlatform };
  } catch (err) {
    let message = "";
    if (err.code === 11000) message = "Specified Version is Already exist.";
    else message = `${err.code} ${err.errmsg}`;
    return { success: false, code: 409, message: message };
  }
};
