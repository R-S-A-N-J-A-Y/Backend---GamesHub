require("dotenv").config();
const PrivateKey = process.env.PRIVATE_KEY;

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JoiBase = require("joi");
const JoiPhone = require("joi-phone-number");
const Joi = JoiBase.extend(JoiPhone);

const UserSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    role: { type: String, required: true, default: "user" },

    likedGames: { type: [mongoose.Types.ObjectId], ref: "Game" },
    watchList: [
      {
        game: { type: mongoose.Types.ObjectId, ref: "Game" },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    recentlyWatched: { type: [mongoose.Types.ObjectId], ref: "Game" },
    cart: [
      {
        game: { type: mongoose.Types.ObjectId, ref: "Game" },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    purchaseHistory: { type: [mongoose.Types.ObjectId], ref: "Purchase" },
  },
  { timestamps: true }
);

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.name, email: this.email, role: this.role },
    PrivateKey
  );
  return token;
};

const UserModel = mongoose.model("User", UserSchema);

const Validate = (data, countryCode) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name must be at most 100 characters",
      "any.required": "Name is required",
    }),

    email: Joi.string().email().required().messages({
      "string.email": "Enter a valid email address",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),

    password: Joi.string().min(6).max(20).required().messages({
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password must be at most 20 characters",
      "any.required": "Password is required",
    }),

    phone: Joi.string()
      .phoneNumber({ defaultCountry: countryCode, format: "e164" })
      .required()
      .messages({
        "string.phoneNumber": "Enter a valid phone number with country code",
        "string.empty": "Phone number is required",
        "any.required": "Phone number is required",
      }),

    dob: Joi.date().required().messages({
      "date.base": "Date of Birth must be a valid date",
      "any.required": "Date of Birth is required",
    }),

    gender: Joi.string().required().messages({
      "string.empty": "Gender is required",
      "any.required": "Gender is required",
    }),
    role: Joi.string().valid("user", "admin").default("user"),
  });

  return schema.validate(data);
};

module.exports = { UserModel, Validate };
