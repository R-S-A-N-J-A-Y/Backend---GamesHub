const mongoose = require("mongoose");
const Joi = require("joi");

const StudioSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  gamesId: { type: [mongoose.Types.ObjectId], ref: "Game" },
});

const StudioModel = mongoose.model("Studio", StudioSchema);

const Validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    imageUrl: Joi.string().pattern(
      /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/
    ),
    gamesId: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
  });
  return schema.validate(data);
};

module.exports = { StudioModel, Validate };
