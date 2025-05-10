const { UserModel, Validate } = require("../models/UserModel");
const bcrypt = require("bcrypt");

const saldRounds = 15;

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
    const result = await UserModel.find({ email });
    if (result.length === 0)
      return { success: false, message: "User not exist." };
    const isMatch = await bcrypt.compare(password, result[0].password);
    if (!isMatch)
      return { success: false, message: "Email or Password is Incorrect." };
    return { success: true, data: result };
  } catch (err) {
    console.log(err);
    return { success: false, message: err };
  }
};

exports.createUser = async (data, countryCode) => {
  const { error } = Validate(data, countryCode);
  if (error)
    return {
      success: false,
      code: 409,
      message: error.details.map((err) => err.message).join(", "),
    };
  const hashedPassword = await bcrypt.hash(data.password, saldRounds);
  try {
    const newUser = new UserModel({ ...data, password: hashedPassword });
    await newUser.save();
    return {
      success: true,
      data: newUser,
      message: "User Created Successfully.",
    };
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

    return {
      success: false,
      message: "Server down. Try Again after some time.",
    };
  }
};
