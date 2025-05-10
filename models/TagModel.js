const mongoose = require("mongoose");
const Joi = require("joi");

const TagSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  gamesId: { type: [mongoose.Types.ObjectId], ref: "Games" },
});

const TagModel = mongoose.model("Tag", TagSchema);

const Validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    gamesId: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
  });
  return schema.validate(data);
};

module.exports = { TagModel, Validate };
