const mongoose = require("mongoose");
const Joi = require("joi");

const GenreSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  gamesID: [{ type: mongoose.Types.ObjectId, ref: "Games" }],
});

const GenreModel = mongoose.model("Genre", GenreSchema);

const Validate = (data) => {
  const Schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    gamesID: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
  });

  return Schema.validate(data);
};

module.exports = { GenreModel, Validate };
