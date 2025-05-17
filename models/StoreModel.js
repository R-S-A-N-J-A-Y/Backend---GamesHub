const Joi = require("joi");
const mongoose = require("mongoose");

const StoreSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  url: String,
  region: String,
  gamesId: { type: [mongoose.Types.ObjectId], ref: "Game" },
});

const StoreModel = mongoose.model("Store", StoreSchema);

const Validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    url: Joi.string().pattern(
      /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/
    ),
    region: Joi.string().pattern(/^[A-Za-z ]{2,30}$/),
    gamesId: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
  });

  return schema.validate(data);
};

module.exports = { StoreModel, Validate };
