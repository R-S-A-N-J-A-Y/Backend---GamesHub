const {
  PlatformVersionModel,
  Validate,
} = require("../models/PlatformVersionModel");
const Platform = require("./Platform");

// get platformV by id
const getById = async (id) => {
  try {
    let data = await PlatformVersionModel.findOne({ _id: id })
      .select("-__v")
      .populate("parentPlatform", "name")
      .populate("gamesId", "_id name coverImageUrl ratings");
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};

// get all the platforms
const getAll = async (pageNumber = 0, limit = 0) => {
  const offset = pageNumber * limit;
  try {
    let data = await PlatformVersionModel.find().skip(offset).limit(limit);
    data = data.map((platformV) => ({
      ...platformV._doc,
      totalGames: platformV.gamesId?.length || 0,
    }));
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};

//Get PlatformVersion id by name, Input: name
const getId = async (name) => {
  try {
    const data = await PlatformVersionModel.find({ name });
    if (data.length === 0)
      return { success: false, message: `${name} is not available` };
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};

//Get object Ids of PlatformVersion - Input : [Name]
const getIds = async (arr) => {
  try {
    const results = await Promise.all(arr.map((name) => getId(name)));
    for (let result of results) {
      if (!result.success) return result;
    }
    const ids = results.map((result) => result.data[0]._id);
    return { success: true, data: ids };
  } catch (err) {
    return { success: false, message: err };
  }
};

// Add new Platform details to Db
const addPlatform = async (data) => {
  // Validating the User data
  const { error } = Validate(data);
  if (error)
    return {
      success: false,
      code: 400,
      message: error.details.map((d) => d.message).join(", "),
    };

  //getting the id Of platform
  const result = await Platform.getId(data.parentPlatform);
  if (!result.success) return result;

  const NewData = { ...data, parentPlatform: result.id };
  try {
    const NewPlatform = new PlatformVersionModel(NewData);
    await NewPlatform.save();
    return { success: true, data: NewPlatform };
  } catch (err) {
    let message = "";
    if (err.code === 11000) message = "Specified Version is Already exist.";
    else message = `${err.code} ${err.errmsg}`;
    return { success: false, code: 409, message: message };
  }
};

//Add Game Id to existing PlatformVersions
const addGameId = async (PlatformVersionIds, GameId) => {
  try {
    await PlatformVersionModel.updateMany(
      { _id: { $in: PlatformVersionIds } },
      { $addToSet: { gamesId: GameId } }
    );
    return { success: true };
  } catch (err) {
    return { success: false, message: err };
  }
};

module.exports = { getById, getAll, getId, getIds, addPlatform, addGameId };
