const { GenreModel, Validate } = require("../../models/GenreModel");
const _ = require("lodash");

// get all the Genre name and id
exports.getAll = async () => {
  try {
    let data = await GenreModel.find();
    data = data.map((genre) => _.pick(genre, ["_id", "name"]));
    return { success: true, data: data };
  } catch (err) {
    console.log(err);
    return { success: false, message: `${err.code} ${err.errmsg}` };
  }
};

// Add new Genre details to Db
exports.addGenre = async (data) => {
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
