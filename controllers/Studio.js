const { StudioModel, Validate } = require("../models/StudiosModel");
const _ = require("lodash");

// get genre by id
const getById = async (id) => {
  try {
    let data = await StudioModel.findOne({ _id: id })
      .select("-__v")
      .populate({
        path: "gamesId",
        select: "_id name coverImageUrl peopleAdded ratings likes price",
        populate: {
          path: "platforms",
          select: "parentPlatform",
          populate: { path: "parentPlatform", select: "name" },
        },
      });
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};

// get all the Studios name and id
const getAll = async (pageNumber = 0, limit = 0) => {
  const offset = pageNumber * limit;
  try {
    let data = await StudioModel.find().skip(offset).limit(limit);
    data = data.map((Studio) => ({
      ...Studio._doc,
      totalGames: Studio.gamesId?.length || 0,
    }));
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};

//Get object Id of Studio - Input : Name
const getId = async (name) => {
  try {
    let data = await StudioModel.find({ name });
    if (data.length === 0)
      return { success: false, message: `${name} is not available` };
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};

//Get object Id of Studio - Input : [Name]
const getIds = async (arr) => {
  try {
    const results = await Promise.all(arr.map((name) => getId(name)));
    // Check for any failed responses
    for (let res of results) {
      if (!res.success) return res;
    }

    const ids = results.map((res) => res.data[0]._id);
    return { success: true, data: ids };
  } catch (err) {
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};

// Add new Studio details to Db
const addStudio = async (data) => {
  const { error } = Validate(data);
  if (error) {
    return {
      success: false,
      code: 400,
      message: error.details.map((d) => d.message).join(", "),
    };
  }

  try {
    const StudioData = new StudioModel(data);
    await StudioData.save();
    return { success: true, data: StudioData };
  } catch (err) {
    let message = "";
    if (err.code === 11000) message = "Specified Studio Name is Already exist.";
    else message = `${err.code} ${err.errmsg}`;
    return { success: false, code: 409, message: message };
  }
};

//Add Game Id to existing Studio
const addGameId = async (StudioIds, gameId) => {
  try {
    await StudioModel.updateMany(
      { _id: { $in: StudioIds } },
      { $addToSet: { gamesId: gameId } }
    );
    return { success: true };
  } catch (err) {
    return { success: false, message: err };
  }
};

module.exports = { getById, getAll, getId, getIds, addStudio, addGameId };
