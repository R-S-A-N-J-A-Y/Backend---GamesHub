const mongoose = require("mongoose");

const { UserModel, Validate } = require("../models/UserModel");
const _ = require("lodash");
const bcrypt = require("bcrypt");

const saldRounds = 15;

// Get - Normal fetch Controllers

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

exports.getUserCart = async (_id) => {
  try {
    const User = await UserModel.findOne({ _id }).select("cart");
    if (!User)
      return { success: false, statusCode: 400, message: "No User is Found" };
    return { success: true, statusCode: 200, data: User };
  } catch (err) {
    return { success: false, statusCode: 500, message: "Backend Dead..." };
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

// User Recent Viewed Games
exports.getUserRecents = async (_id) => {
  if (!mongoose.Types.ObjectId.isValid(_id))
    return {
      success: false,
      statusCode: 400,
      message: "Id is not an Valid Object id",
    };

  try {
    const User = await UserModel.findById(_id).populate({
      path: "recentlyWatched",
      model: "Game",
      select: "_id name coverImageUrl price platforms ratings",
      populate: {
        path: "platforms",
        select: "name",
        populate: { path: "parentPlatform", select: "name" },
      },
    });

    if (!User)
      return { success: false, statusCode: 400, message: "User not found..." };

    const liked = User.likedGames.map((id) => id.toString());
    const watchList = User.watchList.map((obj) => obj.game.toString());

    const UpdatedData = User.recentlyWatched.map((game) => ({
      ...game._doc,
      liked: liked.includes(game._id.toString()),
      watched: watchList.includes(game._id.toString()),
    }));

    return { success: true, statusCode: 200, data: UpdatedData };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      statusCode: 500,
      message: "Error fetching the User...",
    };
  }
};

const GameController = require("./Game");

exports.getWatchlistGames = async (userId, isTop3) => {
  try {
    const User = await UserModel.findOne({ _id: userId });
    if (!User) return { success: false, message: "User not exists." };

    const liked = User.likedGames.map((gameId) => gameId.toString());
    const sliced = User.watchList.slice(0, isTop3 ? 4 : User.watchList.length);

    const gameResults = await Promise.all(
      sliced.map((list) => GameController.getById(list.game))
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
          "price",
          "ratings",
        ]),
        addedAt: sliced[idx].addedAt,
        liked: liked.includes(res.data._id.toString()),
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
      .select("cart _id")
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

// Patch - Toggle Controllers

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

    await User.save();
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
      User.watchList = User.watchList.filter(
        (obj) => obj.game.toString() !== gameId
      );
    else {
      const alreadyInWatchList = User.watchList.some(
        (item) => item.game.toString() === gameId.toString()
      );
      if (!alreadyInWatchList)
        User.watchList.push({ game: gameId, addedAt: new Date() });
    }

    await User.save();
    return { success: true };
  } catch (err) {
    return { success: false, message: "Invalid User Id" };
  }
};

const { updateLRUList } = require("../utils/LRU");

exports.recentlyWatched = async (UserId, gameId) => {
  try {
    const User = await UserModel.findById(UserId);
    if (!User)
      return { success: false, statusCode: 400, message: "User not found..." };

    User.recentlyWatched = updateLRUList(User.recentlyWatched, gameId);
    await User.save();

    return {
      success: true,
      statusCode: 200,
      message: "Updated successfully...",
    };
  } catch (err) {
    return { success: false, statusCode: 500, message: "Backend is Dead..." };
  }
};

exports.updateCart = async (UserId, cartId, value) => {
  try {
    const User = await UserModel.findOne({ _id: UserId });
    if (!User) return { statusCode: 404, message: "User not found..." };

    const cart = User.cart.find((obj) => obj._id.toString() === cartId);
    if (!cart) return { statusCode: 404, message: "Cart item not found..." };

    const UpdatedQuantity = cart.quantity + value;
    if (UpdatedQuantity < 1 || UpdatedQuantity > 5)
      return {
        statusCode: 400,
        message: "Quantity must be between 1 and 5.",
      };

    User.cart = User.cart.map((obj) =>
      obj._id.toString() === cartId
        ? { ...obj, quantity: UpdatedQuantity }
        : obj
    );
    await User.save();
    return { statusCode: 200, message: "Cart Updated successfully." };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, message: "Server is down..." };
  }
};

// Post - Create an New Content

exports.CreateCart = async (UserId, gameId, isInc) => {
  try {
    const UserCart = await UserModel.findOne(
      {
        _id: UserId,
        "cart.game": gameId,
      },
      { "cart.$": 1 }
    );

    if (!UserCart) {
      await UserModel.updateOne(
        { _id: UserId },
        { $push: { cart: { game: gameId } } }
      );
      return { success: true, statusCode: 201 };
    }

    if (UserCart.cart[0].quantity === 1 && !isInc) {
      return { statusCode: 400, message: "Quantity cannot be empty." };
    }

    if (UserCart.cart[0].quantity === 5 && isInc) {
      return {
        statusCode: 400,
        message: "Quantity cannot be Increased above 5.",
      };
    }

    await UserModel.updateOne(
      { _id: UserId, "cart._id": UserCart.cart[0]._id },
      { $inc: { "cart.$.quantity": isInc ? 1 : -1 } }
    );

    return { success: true, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { success: false, statusCode: 500, message: "Backend is dead..." };
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

// Delete - Delete Controllers

exports.deleteCart = async (userId, cartId) => {
  try {
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { cart: { _id: cartId } } }
    );
    return { statusCode: 200, message: "Deleted Successfully." };
  } catch {
    return { statusCode: 500, message: "Deleted not successfull." };
  }
};
