const { StoreModel, Validate } = require("../../models/StoreModel");
const _ = require("lodash");

// get all the stores name and url
exports.getAll = async (id) => {
  const offset = id * 20;
  const limit = 20;
  try {
    let data = await StoreModel.find().skip(offset).limit(limit);
    data = data.map((obj) => _.pick(obj, ["name", "url"]));
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};
