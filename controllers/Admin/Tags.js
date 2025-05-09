const { TagModel, Validate } = require("../../models/TagModel");

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
