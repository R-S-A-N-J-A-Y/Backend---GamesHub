const { UserModel, Validate } = require("../models/UserModel");

exports.getAll = async () => {
  try {
    const result = await UserModel.find();
    return { success: true, data: result };
  } catch (err) {
    return { success: false, message: err };
  }
};

exports.getUser = async (email, password) => {
  try {
    const result = await UserModel.find({ email: email, password: password });
    if (result.length === 0)
      return { success: false, message: "User not exist." };
    return { success: true, data: result };
  } catch (err) {
    return { success: false, message: err };
  }
};

exports.createUser = async (data) => {
  const { error } = Validate(data, "IN");
  if (error)
    return {
      success: false,
      code: 409,
      message: error.details.map((err) => err.message).join(", "),
    };
  try {
    const newUser = new UserModel(data);
    await newUser.save();
    return { success: true, data: newUser };
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.email)
        return {
          success: false,
          code: 400,
          message: "User with mail id already exist.",
        };
      else if (err.keyPattern?.phone)
        return {
          success: false,
          code: 400,
          message: "User with this Phone number already exist.",
        };
    }

    return { success: false, message: err };
  }
};
