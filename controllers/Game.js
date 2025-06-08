const { GameModel, Validate } = require("../models/GameModels");

const { getIds: StudioIds, addGameId: StudioAddGameId } = require("./Studio");
const { getIds: GenreIds, addGameId: GenreAddGameId } = require("./Genre");
const { getIds: TagIds, addGameId: TagAddGameId } = require("./Tags");
const { getIds: StoreIds, addGameId: StoreAddGameId } = require("./Store");
const {
  getIds: platformIds,
  addGameId: PlatformAddGameId,
} = require("./PlatformVersion");

exports.getAll = async (page = 0, limit = 0) => {
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

    return { success: true, data: result };
  } catch (err) {
    return { success: true, message: "Server Error" };
  }
};

exports.getById = async (id) => {
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

exports.createGame = async (data) => {
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
