const mongoose = require("mongoose");
const Joi = require("joi");

const PlatformVersionSchema = mongoose.Schema({
  parentPlatform: {
    type: mongoose.Types.ObjectId,
    ref: "Platform",
    required: true,
  },
  name: { type: String, required: true, unique: true },
  gamesId: { type: [mongoose.Types.ObjectId], ref: "Game", unique: true },
});

const PlatformVersionModel = mongoose.model(
  "PlatformVersion",
  PlatformVersionSchema
);

const Validate = (data) => {
  const schema = Joi.object({
    parentPlatform: Joi.string().required().messages({
      "any.required": `"parentPlatform" is required`,
    }),

    name: Joi.string().min(1).max(100).required().messages({
      "string.base": `"name" must be a string`,
      "string.empty": `"name" cannot be empty`,
      "any.required": `"name" is required`,
    }),

    GamesId: Joi.array()
      .items(
        Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .messages({
            "string.pattern.base": `"GamesId" must be valid ObjectIds`,
          })
      )
      .messages({ "array.base": `"GamesId" must be an array` }),
  });

  return schema.validate(data);
};

module.exports = { PlatformVersionModel, Validate };
