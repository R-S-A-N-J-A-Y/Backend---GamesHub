const { StoreModel, Validate } = require("../models/StoreModel");
const _ = require("lodash");

// get genre by id
const getById = async (id) => {
  try {
    let data = await StoreModel.findOne({ _id: id })
      .select("-__v")
      .populate("gamesId", "_id name coverImageUrl ratings");
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};

// get all the stores name and url
const getAll = async (pageNumber, limit) => {
  const offset = pageNumber * limit;
  try {
    let data = await StoreModel.find().skip(offset).limit(limit);
    data = data.map((store) => ({
      _id: store._id,
      name: store.name,
      url: store.url,
      totalGames: store.gamesId?.length || 0,
    }));
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};

//Get Store id by name, Input: name
const getId = async (name) => {
  try {
    const data = await StoreModel.find({ name });
    if (data.length === 0)
      return { success: false, message: `${name} is not available` };
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};

//Get object Ids of Store - Input : [Name]
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

// Add new Store details to Db
const addStore = async (data) => {
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

//Add Game Id to existing Stores
const addGameId = async (StoreIds, GameId) => {
  try {
    await StoreModel.updateMany(
      { _id: { $in: StoreIds } },
      { $addToSet: { gamesId: GameId } }
    );
    return { success: true };
  } catch (err) {
    return { success: false, message: err };
  }
};

module.exports = { getById, getAll, getIds, getId, addStore, addGameId };
