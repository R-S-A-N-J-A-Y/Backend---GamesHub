const mongoose = require("mongoose");
const Joi = require("joi");

const PlatformVersionSchema = mongoose.Schema({
  parentPlatform: {
    type: mongoose.Types.ObjectId,
    ref: "Platform",
    required: true,
  },
  name: { type: String, required: true, unique: true },
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

const PlatformVersionModel = mongoose.model(
  "PlatformVersion",
  PlatformVersionSchema
);

const Validate = (data) => {
  const schema = Joi.object({
    parentPlatform: Joi.string().required(),

    name: Joi.string().min(1).max(100).required(),
    coverImageUrl: Joi.string().min(1).max(300).required(),
    shortName: Joi.string().min(1).max(100).required(),
    gamesId: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),

    popularGame: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        likes: Joi.string().required(),
      })
    ),
  });

  return schema.validate(data);
};

module.exports = { PlatformVersionModel, Validate };
