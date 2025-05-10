const { StudioModel, Validate } = require("../models/StudiosModel");
const _ = require("lodash");

// get all the Studios name and id
exports.getAll = async (id) => {
  const offset = id * 20;
  const limit = 20;
  try {
    let data = await StudioModel.find().skip(offset).limit(limit);
    data = data.map((Studio) => _.pick(Studio, ["_id", "name"]));
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};

// Add new Studio details to Db
exports.addStudio = async (data) => {
  const { error } = Validate(data);
  if (error) {
    return {
      success: false,
      code: 400,
      message: error.details.map((d) => d.message).join(", "),
    };
  }

  try {
    const StudioData = new StudioModel(data);
    await StudioData.save();
    return { success: true, data: StudioData };
  } catch (err) {
    let message = "";
    if (err.code === 11000) message = "Specified Studio Name is Already exist.";
    else message = `${err.code} ${err.errmsg}`;
    return { success: false, code: 409, message: message };
  }
};
