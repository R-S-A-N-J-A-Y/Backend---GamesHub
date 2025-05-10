const { StoreModel, Validate } = require("../models/StoreModel");
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

// Add new Store details to Db
exports.addStore = async (data) => {
  const { error } = Validate(data);
  if (error)
    return {
      success: false,
      code: 400,
      message: error.details.map((d) => d.message).join(", "),
    };
  try {
    const NewStore = new StoreModel(data);
    await NewStore.save();
    return { success: true, data: NewStore };
  } catch (err) {
    let message = "";
    if (err.code === 11000) message = "Specified Store Name is Already exist.";
    else message = `${err.code} ${err.errmsg}`;
    return { success: false, code: 409, message: message };
  }
};
