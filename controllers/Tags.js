const { TagModel, Validate } = require("../models/TagModel");
const _ = require("lodash");

// get genre by id
const getById = async (id) => {
  try {
    let data = await TagModel.findOne({ _id: id })
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

// get all the tags name and id
const getAll = async (pageNumber = 0, limit = 0) => {
  const offset = pageNumber * limit;
  try {
    let data = await TagModel.find().skip(offset).limit(limit);
    data = data.map((tag) => ({
      ...tag._doc,
      totalGames: tag.gamesId?.length || 0,
    }));
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};

//Get Tag by id, Input: Name
const getId = async (name) => {
  try {
    const data = await TagModel.find({ name });
    if (data.length === 0)
      return { success: false, message: `${name} is not available` };
    return { success: true, data: data };
  } catch (err) {
    return { success: false, message: err };
  }
};

//Get object Ids of Tag - Input : [Name]
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

// Add new tag details to Db
const addTag = async (data) => {
  const { error } = Validate(data);
  if (error) {
    return {
      success: false,
      code: 400,
      message: error.details.map((d) => d.message).join(", "),
    };
  }

  try {
    const TagData = new TagModel(data);
    await TagData.save();
    return { success: true, data: TagData };
  } catch (err) {
    let message = "";
    if (err.code === 11000) message = "Specified Tag Name is Already exist.";
    else message = `${err.code} ${err.errmsg}`;
    return { success: false, code: 409, message: message };
  }
};

//Add Game Id to existing Tags
const addGameId = async (TagIds, GameId) => {
  try {
    await TagModel.updateMany(
      { _id: { $in: TagIds } },
      { $addToSet: { gamesId: GameId } }
    );
    return { success: true };
  } catch (err) {
    return { success: false, message: err };
  }
};

const addTags = async (tagsArray) => {
  try {
    const insertedTags = await TagModel.insertMany(tagsArray, {
      ordered: false,
    });
    return { success: true, data: insertedTags };
  } catch (error) {
    return { success: false, message: error.message, code: 400 };
  }
};

module.exports = { getById, getAll, getId, getIds, addTag, addGameId, addTags };
