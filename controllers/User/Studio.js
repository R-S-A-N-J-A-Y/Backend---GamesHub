const { StudioModel, Validate } = require("../../models/StudiosModel");
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
