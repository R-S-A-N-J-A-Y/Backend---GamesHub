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

// Add new tag details to Db
exports.addTag = async (data) => {
  const { error } = Validate(data);
  if (error) {
    return {
      success: false,
      code: 400,
      message: error.details.map((d) => d.message).join(", "),
    };
  }

  try {
    const TagData = new TagModel(data);
    await TagData.save();
    return { success: true, data: TagData };
  } catch (err) {
    let message = "";
    if (err.code === 11000) message = "Specified Tag Name is Already exist.";
    else message = `${err.code} ${err.errmsg}`;
    return { success: false, code: 409, message: message };
  }
};
