const { TagModel, Validate } = require("../../models/TagModel");
const _ = require("lodash");

// get all the tags name and id
exports.getAll = async (id) => {
  const offset = id * 20;
  const limit = 20;
  try {
    let data = await TagModel.find().skip(offset).limit(limit);
    data = data.map((tag) => _.pick(tag, ["_id", "name"]));
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};
