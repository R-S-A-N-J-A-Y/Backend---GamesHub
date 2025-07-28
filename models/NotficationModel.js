const mongoose = require("mongoose");
const Joi = require("joi");

const modelSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gamesId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },

    type: {
      type: String,
      enum: [
        "NEW_GAME",
        "GAME_UPDATE",
        "GAME_DISCOUNT",
        "OUT_OF_STOCK_CART",
        "PROMOTION",
        "GAME_LAUNCH_EVENT",
        "ORDER_SUCCESS",
        "ORDER_FAILURE",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    actionUrl: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const NotficationModel = mongoose.model("Notification", modelSchema);

const Validate = (data) => {
  const Schema = Joi.object({
    userId: Joi.string().required(),
    gamesId: Joi.string().required(),
    type: Joi.string()
      .valid(
        "NEW_GAME",
        "GAME_UPDATE",
        "GAME_DISCOUNT",
        "OUT_OF_STOCK_CART",
        "PROMOTION",
        "GAME_LAUNCH_EVENT",
        "ORDER_SUCCESS",
        "ORDER_FAILURE"
      )
      .required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    actionUrl: Joi.string().required(),
    meta: Joi.string().optional(),
  });

  return Schema.validate(data);
};

module.exports = { Validate, NotficationModel };
