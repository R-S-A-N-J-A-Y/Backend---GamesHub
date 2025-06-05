const { UserModel, Validate } = require("../models/UserModel");
const _ = require("lodash");
const bcrypt = require("bcrypt");

const saldRounds = 15;

exports.getMe = async (id) => {
  try {
    const user = await UserModel.findOne({ _id: id });
    return {
      success: true,
      data: _.pick(user, ["name", "email", "dob", "phone", "gender", "role"]),
    };
  } catch (err) {
    return { success: false, message: "Invalid User Id" };
  }
};

exports.getAll = async () => {
  try {
    const result = await UserModel.find();
    return { success: true, data: result };
  } catch (err) {
    return { success: false, message: err };
  }
};

exports.toggleLike = async (UserId, gameId, liked) => {
  try {
    const User = await UserModel.findOne({ _id: UserId });
    if (!User) {
      return { success: false, message: "User not found" };
    }
    if (!liked)
      User.likedGames = User.likedGames.filter(
        (id) => id.toString() !== gameId
      );
    else {
      if (!User.likedGames.includes(gameId)) User.likedGames.push(gameId);
    }

    User.save();
    return { success: true };
  } catch (err) {
    return { success: false, message: "Invalid User Id" };
  }
};

exports.toggleWatchList = async (UserId, gameId, watched) => {
  try {
    const User = await UserModel.findById({ _id: UserId });
    if (!User) return { success: false, message: "User not found" };

    if (!watched)
      User.watchList = User.watchList.filter((id) => id.toString() !== gameId);
    else {
      if (!User.watchList.includes(gameId)) User.watchList.push(gameId);
    }

    User.save();
    return { success: true };
  } catch (err) {
    return { success: false, message: "Invalid User Id" };
  }
};

exports.toggleCart = async (UserId, gameId, isAdded) => {
  try {
    const User = await UserModel.findById({ _id: UserId });
    if (!User) return { success: false, message: "User not found" };

    if (!isAdded)
      User.cart = User.cart.filter((id) => id.toString() !== gameId);
    else {
      if (!User.cart.includes(gameId)) User.cart.push(gameId);
    }

    User.save();
    return { success: true };
  } catch (err) {
    return { success: false, message: "Invalid User Id" };
  }
};

exports.getUser = async (email, password) => {
  try {
    //Getting the User with Email
    const result = await UserModel.findOne({ email });
    if (!result) return { success: false, message: "User not exist." };

    //Verify Password
    const isMatch = await bcrypt.compare(password, result.password);
    if (!isMatch)
      return { success: false, message: "Email or Password is Incorrect." };

    //Genrating web token
    const token = result.generateAuthToken();
    return {
      success: true,
      data: _.pick(result, ["_id", "name", "email", "watchList"]),
      token: token,
    };
  } catch (err) {
    console.log(err);
    return { success: false, message: err };
  }
};

exports.getUserActions = async (_id) => {
  try {
    const User = await UserModel.findById(_id);
    return {
      success: true,
      data: { liked: User.likedGames, watchList: User.watchList },
    };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Unexpencted Error Occurred." };
  }
};

const GameController = require("./Game");

exports.getTop3WatchlistGames = async (userId) => {
  try {
    const User = await UserModel.findOne({ _id: userId });
    if (!User) return { success: false, message: "User not exists." };
    const sliced = User.watchList.slice(0, 3);

    const gameResults = await Promise.all(
      sliced.map((gameId) => GameController.getById(gameId))
    );

    const games = gameResults
      .filter((res) => res.success)
      .map((res, idx) => ({
        ..._.pick(res.data, [
          "_id",
          "name",
          "shortName",
          "coverImageUrl",
          "platforms",
        ]),
        addedAt: sliced[idx].addedAt,
      }));

    return { success: true, data: games };
  } catch (err) {
    console.log(err);
    return { success: false, message: err };
  }
};

exports.getCart = async (userId) => {
  try {
    const result = await UserModel.findOne({ _id: userId })
      .select("cart -_id")
      .populate({
        path: "cart.game",
        select: "name coverImageUrl platforms price",
        populate: { path: "platforms", select: "name" },
      });
    if (!result) {
      return { success: false, message: "User not found." };
    }
    return { success: true, data: result.cart };
  } catch (err) {
    console.warn(err);
    return { success: false, message: "Error Fetching in the Database." };
  }
};

exports.createUser = async (data, countryCode) => {
  // Verifying the Data send by client
  const { error } = Validate(data, countryCode);
  if (error)
    return {
      success: false,
      code: 409,
      message: error.details.map((err) => err.message).join(", "),
    };

  // hashing the password
  const hashedPassword = await bcrypt.hash(data.password, saldRounds);
  try {
    //Creating new User
    const newUser = new UserModel({ ...data, password: hashedPassword });
    await newUser.save();

    // Genrating web token
    const token = newUser.generateAuthToken();
    return {
      success: true,
      data: _.pick(newUser, ["_id", "name", "email"]),
      token: token,
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
