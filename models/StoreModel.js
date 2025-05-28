const Joi = require("joi");
const mongoose = require("mongoose");

const StoreSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  url: String,
  coverImageUrl: { type: String, required: true, unique: true },
  shortName: { type: String, required: true, unique: true },
  gamesId: [{ type: mongoose.Types.ObjectId, ref: "Game" }],
  popularGame: [
    {
      name: { type: String, required: true },
      likes: { type: String, required: true },
    },
  ],
});

const StoreModel = mongoose.model("Store", StoreSchema);

const Validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    url: Joi.string().pattern(
      /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/
    ),
    coverImageUrl: Joi.string().min(1).max(100).required(),
    shortName: Joi.string().min(1).max(100).required(),
    gamesID: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    popularGame: Joi.array().items(Joi.string()),
  });

  return schema.validate(data);
};

module.exports = { StoreModel, Validate };
