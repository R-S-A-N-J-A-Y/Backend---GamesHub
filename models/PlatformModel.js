const Joi = require("joi");
const mongoose = require("mongoose");

const PlatformSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  manufacturer: { type: String, default: "Various" },
});

const PlatformModel = mongoose.model("Platform", PlatformSchema);

const Validate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    manufacturer: Joi.string().min(2).max(100),
  });

  return schema.validate(data);
};

module.exports = { PlatformModel, Validate };
