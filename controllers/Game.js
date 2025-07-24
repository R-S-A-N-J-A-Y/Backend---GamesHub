require("dotenv").config();
const jwt = require("jsonwebtoken");

const { GameModel, Validate } = require("../models/GameModels");

const { getIds: StudioIds, addGameId: StudioAddGameId } = require("./Studio");
const { getIds: GenreIds, addGameId: GenreAddGameId } = require("./Genre");
const { getIds: TagIds, addGameId: TagAddGameId } = require("./Tags");
const { getIds: StoreIds, addGameId: StoreAddGameId } = require("./Store");
const {
  getIds: platformIds,
  addGameId: PlatformAddGameId,
  getIdsByParentPlatform: platformIdsByParentPlatform,
} = require("./PlatformVersion");

const UserController = require("../controllers/User");

// Get All Game
const getAll = async (page = 0, limit = 0, sortBy, order, platformArray) => {
  const offset = limit * page;
  const sortOrder = order === "asc" ? 1 : -1;
  try {
    let query = GameModel.find(
      platformArray && platformArray.length > 0
        ? { platforms: { $in: platformArray } }
        : {}
    );

    query = query
      .skip(offset)
      .limit(limit)
      .select("_id name coverImageUrl peopleAdded ratings likes price")
      .populate({
        path: "platforms",
        select: "parentPlatform",
        populate: { path: "parentPlatform", select: "name" },
      });

    const isValidSortField = sortBy && GameModel.schema.path(sortBy);
    if (sortBy && isValidSortField) {
      query = query.sort({ [sortBy]: sortOrder });
    }

    const result = await query; // Await after sorting

    return { success: true, statusCode: 200, data: result };
  } catch (err) {
    return { success: false, statusCode: 500, message: "Backend is Dead..." };
  }
};

// Get an Game By Id
const getById = async (id) => {
  try {
    const data = await GameModel.findOne({ _id: id })
      .select(["-createdAt", "-updatedAt", "-__v"])
      .populate({
        path: "platforms",
        select: "parentPlatform",
        populate: { path: "parentPlatform", select: "name" },
      })
      .populate({
        path: "tags",
        select: "_id name",
      });
    if (!data)
      return {
        success: false,
        statusCode: 400,
        message: "Game with Specified Id is not in database.",
      };
    return { success: true, data: data };
  } catch (err) {
    console.log(err);
    return { success: false, message: err };
  }
};

// Get Games for User
const getAllwithUserMeta = async (token, page, limit, sortBy, order) => {
  let likedGames = [];
  let watchList = [];
  try {
    const decode = jwt.verify(token, process.env.PRIVATE_KEY);
    const User = await UserController.getUserActions(decode._id);
    if (User.success) {
      likedGames = User.data.liked;
      watchList = User.data.watchList;
    } else {
      return { statusCode: 400, message: "No User Found." };
    }
  } catch (err) {
    return { statusCode: 401, message: "Invalid token." };
  }

  const { success, statusCode, ...result } = await getAll(
    page,
    limit,
    sortBy,
    order
  );
  if (!success) return { statusCode, result };

  // Updating for Log in User
  const watchListGameIds = watchList.map((item) => item.game.toString());

  const UpdatedResult = result.data.map((game) => ({
    ...game._doc,
    liked: likedGames.includes(game._id.toString()),
    watched: watchListGameIds.includes(game._id.toString()),
  }));

  return { statusCode: 200, data: UpdatedResult };
};

//Get Game for User
const getGameByIdWithUserMeta = async (token, gameId) => {
  let isIncart = "";
  try {
    const decode = jwt.verify(token, process.env.PRIVATE_KEY);
    const UserCart = await UserController.getUserCart(decode._id);
    const UpdateRecentlyWatched = await UserController.recentlyWatched(
      decode._id,
      gameId
    );

    if (!UserCart.success) return UserCart;
    if (!UpdateRecentlyWatched) return UpdateRecentlyWatched;

    isIncart = UserCart.data.cart.find((obj) => obj.game.toString() === gameId);
  } catch (err) {
    console.log(err);
    return { success: false, statusCode: 401, message: "Invalid token." };
  }

  const { success, statusCode, ...result } = await getById(gameId);
  if (!success) return { statusCode, result };

  const UpdatedGame = {
    ...result.data._doc,
    isInCart: isIncart ? true : false,
  };
  return { statusCode: 200, data: UpdatedGame };
};

// Filter by platform
const getByFilters = async (platforms, sortBy, order) => {
  try {
    const platformIdResult = await platformIdsByParentPlatform(platforms);
    if (!platformIdResult.success) return platformIdResult;

    const result = await getAll(0, 0, sortBy, order, platformIdResult.data);
    return result;
  } catch (err) {
    return { statusCode: 500, message: "Backend is Dead..." };
  }
};

// Filter by genre
const getGamesByGenre = async (genres) => {
  try {
    const games = await GameModel.find({ genres: { $in: genres } })
      .select("_id name coverImageUrl peopleAdded ratings likes price")
      .populate({
        path: "platforms",
        select: "parentPlatform",
        populate: { path: "parentPlatform", select: "name" },
      });
    if (!games)
      return { statusCode: 400, message: "No games found for certain genre." };
    return { statusCode: 200, data: games };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, message: "Backend is Dead..." };
  }
};

const checkIfGameExists = async (name, shortName) => {
  try {
    const game = await GameModel.findOne({ name, shortName });
    if (game) {
      return {
        exists: true,
        code: 409,
        game,
        message: "Game with the same name and short name already exists...",
      };
    }
    return { exists: false };
  } catch (err) {
    return { exists: false, error: err.message || err };
  }
};

const UpdateGame = async (gameId, data) => {
  if (data.features?.remove?.length) {
    await GameModel.updateOne(
      {
        _id: gameId,
      },
      {
        $pull: {
          features: {
            _id: { $in: data.features.remove },
          },
        },
      }
    );
  }

  const updates = {};

  if (data.features?.added?.length) {
    updates.$addToSet = {
      features: {
        $each: data.features.added,
      },
    };
  }

  if (data.screenshots?.length) {
    updates.$addToSet = {
      ...updates.$addToSet,
      screenshots: {
        $each: data.screenshots,
      },
    };
  }

  const setUpdates = {};
  if (data.name) setUpdates.name = data.name;
  if (data.shortName) setUpdates.shortName = data.shortName;
  if (data.description) setUpdates.description = data.description;
  if (data.price !== undefined) setUpdates.price = data.price;
  if (data.ratings !== undefined) setUpdates.ratings = data.ratings;
  if (data.coverImageUrl) setUpdates.coverImageUrl = data.coverImageUrl;
  if (data.heroImageUrl) setUpdates.heroImageUrl = data.heroImageUrl;
  if (data.video) setUpdates.video = data.video;
  if (data.youtubeLink) setUpdates.youtubeLink = data.youtubeLink;

  if (Object.keys(setUpdates).length) {
    updates.$set = setUpdates;
  }

  try {
    const result = await GameModel.findOneAndUpdate({ _id: gameId }, updates);
    return { success: true, data: result, code: 200 };
  } catch (err) {
    return { success: false, code: 500, message: "Unable to Update" };
  }
};

const NotificationController = require("../controllers/Notifications");

// To create an New Game
const createGame = async (userId, data) => {
  const { error } = Validate(data);
  if (error) return { success: false, code: 400, message: error };

  const IsExist = await checkIfGameExists(data.name, data.shortName);
  if (IsExist.exists) return IsExist;

  try {
    //Get Ids
    let [studios, genres, tags, stores, platforms] = await Promise.all([
      StudioIds(data.studios),
      GenreIds(data.genres),
      TagIds(data.tags),
      StoreIds(data.stores),
      platformIds(data.platforms),
    ]);

    // Check if any failed
    let results = { studios, genres, tags, stores, platforms };
    for (const [key, result] of Object.entries(results)) {
      if (!result.success) {
        return {
          success: false,
          message: `${key} fetch failed: ${result.message}`,
        };
      }
    }

    const GameData = {
      ...data,
      studios: studios.data,
      genres: genres.data,
      tags: tags.data,
      stores: stores.data,
      platforms: platforms.data,
    };

    const NewGame = new GameModel(GameData);
    await NewGame.save();
    //Update All tables with new Game id
    [studios, genres, tags, stores, platforms] = await Promise.all([
      await StudioAddGameId(studios.data, NewGame._id),
      await GenreAddGameId(genres.data, NewGame._id),
      await TagAddGameId(tags.data, NewGame._id),
      await StoreAddGameId(stores.data, NewGame._id),
      await PlatformAddGameId(platforms.data, NewGame._id),
    ]);

    //check for any error in updatetion
    results = { studios, genres, tags, stores, platforms };
    for (const [key, result] of Object.entries(results)) {
      if (!result.success) {
        return {
          success: false,
          message: `${key} fetch failed: ${result.message}`,
        };
      }
    }

    const notificationData = NotificationController.createNotificationData(
      userId,
      NewGame._id,
      "NEW_GAME",
      NewGame.name
    );
    NotificationController.createNotification(notificationData);

    return {
      success: true,
      data: NewGame,
    };
  } catch (err) {
    console.log(err);
    return { success: false, code: 500, message: err };
  }

  // , platforms, collections;
};

module.exports = {
  getAll,
  getById,
  getByFilters,
  createGame,
  getAllwithUserMeta,
  getGameByIdWithUserMeta,
  getGamesByGenre,
  UpdateGame,
};
