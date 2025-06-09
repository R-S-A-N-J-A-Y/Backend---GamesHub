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
const getAll = async (page = 0, limit = 0) => {
  const offset = limit * page;
  try {
    const result = await GameModel.find()
      .skip(offset)
      .limit(limit)
      .select("_id name coverImageUrl peopleAdded ratings likes price")
      .populate({
        path: "platforms",
        select: "parentPlatform",
        populate: { path: "parentPlatform", select: "name" },
      });

    return { statusCode: 200, data: result };
  } catch (err) {
    return { statusCode: 500, message: "Backend is Dead..." };
  }
};

// Get an Game By Id
const getById = async (id) => {
  try {
    const data = await GameModel.findOne({ _id: id })
      .select(["-createdAt", "-updatedAt", "-__v"])
      .populate({
        path: "platforms",
        select: "name _id",
      })
      .populate({
        path: "tags",
        select: "_id name",
      });
    if (!data)
      return {
        success: false,
        code: 400,
        message: "Game with Specified Id is not in database.",
      };
    return { success: true, data: data };
  } catch (err) {
    console.log(err);
    return { success: false, message: err };
  }
};

// Get Game for User
const getAllwithUserMeta = async (token, page, limit) => {
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

  const result = await getAll(page, limit);
  if (!result.success) return { statusCode: 500, result };

  // Updating for Log in User
  const watchListGameIds = watchList.map((item) => item.game.toString());

  const UpdatedResult = result.data.map((game) => ({
    ...game._doc,
    liked: likedGames.includes(game._id.toString()),
    watched: watchListGameIds.includes(game._id.toString()),
  }));

  return { statusCode: 200, result: { ...result, data: UpdatedResult } };
};

const getByFilters = async (platforms, sortBy, order) => {
  try {
    const result = await platformIdsByParentPlatform(platforms);
    if (!result.success) return result;

    const isValidSortField = !!GameModel.schema.path(sortBy);
    if (!isValidSortField)
      return { statusCode: 400, message: "Not an Valid Name field in Sort" };

    const sortOrder = order === "asc" ? 1 : -1;

    const filterdGames = await GameModel.find({
      platforms: { $in: result.data },
    }).sort({ [sortBy]: sortOrder });

    return { statusCode: 200, data: filterdGames };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, message: "Backend is Dead..." };
  }
};

// To create an New Game
const createGame = async (data) => {
  const { error } = Validate(data);
  if (error) return { success: false, code: 409, message: error };
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
    console.log("JHI");
    console.log(NewGame);
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
};
