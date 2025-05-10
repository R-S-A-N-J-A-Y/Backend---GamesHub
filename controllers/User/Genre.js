const { GenreModel, Validate } = require("../../models/GenreModel");
const _ = require("lodash");

// get all the Genre name and id
exports.getAll = async (id) => {
  const limit = 20;
  const offset = id * 20;
  try {
    let data = await GenreModel.find().skip(offset).limit(limit);
    data = data.map((genre) => _.pick(genre, ["_id", "name"]));
    return { success: true, data: data };
  } catch (err) {
    console.log(err);
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};
