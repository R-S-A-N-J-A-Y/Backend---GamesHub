const { GenreModel, Validate } = require("../../models/GenreModel");

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
