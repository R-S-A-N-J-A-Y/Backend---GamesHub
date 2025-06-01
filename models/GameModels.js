const Joi = require("joi");
const mongoose = require("mongoose");

const GameSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    description: { type: String, required: true },

    coverImageUrl: { type: String, required: true },
    screenshots: { type: [String], required: true },
    video: String,
    youtubeLink: { type: [String], required: true },

    features: {
      type: [{ name: String, imageUrl: String, description: String }],
      required: true,
    },

    studios: {
      type: [mongoose.Types.ObjectId],
      ref: "Studios",
      required: true,
    },
    platforms: {
      type: [mongoose.Types.ObjectId],
      ref: "PlatformVersion",
      required: true,
    },
    genres: { type: [mongoose.Types.ObjectId], ref: "Genres", required: true },
    tags: { type: [mongoose.Types.ObjectId], ref: "Tag", required: true },
    stores: { type: [mongoose.Types.ObjectId], ref: "Stores", required: true },
    collections: {
      type: [mongoose.Types.ObjectId],
      ref: "Collections",
    },

    peopleAdded: { type: Number, required: true, default: 0 },
    ratings: { type: Number, required: true, default: 0 },
    totalPurchase: { type: Number, required: true, default: 0 },
    likes: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const GameModel = mongoose.model("Game", GameSchema);

const Validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.empty": `"name" cannot be empty`,
      "any.required": `"name" is required`,
    }),
    shortName: Joi.string().min(2).max(100).required().messages({
      "string.empty": `"shortName" cannot be empty`,
      "any.required": `"shortName" is required`,
    }),
    description: Joi.string().min(2).max(10000).required().messages({
      "string.empty": `"description" cannot be empty`,
      "any.required": `"description" is required`,
    }),

    coverImageUrl: Joi.string().uri().required().messages({
      "string.empty": `"coverImageUrl" cannot be empty`,
      "any.required": `"coverImageUrl" is required`,
    }),
    screenshots: Joi.array().items(Joi.string().uri()).required().messages({
      "array.base": `"screenshots" must be an array`,
      "any.required": `"screenshots" is required`,
    }),
    video: Joi.string().uri(),

    youtubeLink: Joi.string().required().messages({
      "string.empty": `"youtube Link" cannot be empty`,
      "any.required": `"youtube Link" is required`,
    }),

    features: Joi.array().items(Joi.string()).required().message({
      "any.required": `"features" is required`,
    }),

    studios: Joi.array().items(Joi.string()).required().messages({
      "any.required": `"studios" is required`,
    }),
    platforms: Joi.array().items(Joi.string()).required().messages({
      "any.required": `"platforms" is required`,
    }),
    genres: Joi.array().items(Joi.string()).required().messages({
      "any.required": `"genres" is required`,
    }),
    stores: Joi.array().items(Joi.string()).required().messages({
      "any.required": `"stores" is required`,
    }),
    tags: Joi.array().items(Joi.string()).required().messages({
      "any.required": `"tags" is required`,
    }),
    collections: Joi.array().items(Joi.string()),
  });

  return schema.validate(data);
};

module.exports = { GameModel, Validate };
