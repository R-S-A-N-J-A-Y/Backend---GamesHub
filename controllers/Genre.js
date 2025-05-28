const { GenreModel, Validate } = require("../models/GenreModel");
const _ = require("lodash");

// get genre by id
const getById = async (id) => {
  try {
    let data = await GenreModel.findOne({ _id: id })
      .select("-__v")
      .populate("gamesId", "_id name coverImageUrl ratings");
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};

// get all the Genre name and id
const getAll = async (pageNumber = 0, limit = 0) => {
  const offset = pageNumber * 20;
  try {
    let data = await GenreModel.find().skip(offset).limit(limit);
    data = data = data.map((genre) => ({
      ...genre._doc,
      totalGames: genre.gamesId.length || 0,
    }));
    return { success: true, data: data };
  } catch (err) {
    console.log(err);
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};

//Get genre id by name, Input: name
const getId = async (name) => {
  try {
    const data = await GenreModel.find({ name });
    if (data.length === 0)
      return { success: false, message: `${name} is not available` };
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};

//Get object Ids of Genre - Input : [Name]
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

// Add new Genre details to Db
const addGenre = async (data) => {
  const { error } = Validate(data);
  if (error)
    return {
      success: false,
      code: 400,
      message: error.details.map((d) => d.message).join(", "),
    };
  else {
    try {
      const GenreData = new GenreModel(data);
      await GenreData.save();
      return { success: true, data: GenreData };
    } catch (err) {
      let message = "",
        code;
      if (err.code === 11000) message = "Specified Genre is Already exist.";
      else message = `${err.code} ${err.errmsg}`;

      return { success: false, code: 409, message: message };
    }
  }
};

const addGameId = async (GenreIds, GameId) => {
  try {
    await GenreModel.updateMany(
      { _id: { $in: GenreIds } },
      { $addToSet: { gamesID: GameId } }
    );
    return { success: true };
  } catch (err) {
    return { success: false, message: err };
  }
};

module.exports = { getById, getAll, getId, getIds, addGenre, addGameId };
