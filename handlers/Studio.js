const mongoose = require("mongoose");
const express = require("express");
const routes = express.Router();

const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const StudioController = require("../controllers/Studio");
const UserController = require("../controllers/User");

//GET - to get all the Studios
routes.get("/", async (req, res) => {
  const { page, limit } = req.query;
  const result = await StudioController.getAll(page, limit);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

//GET - to get the particular Studio with id
routes.get("/:id", async (req, res) => {
  //get token if user is logged;
  const token = req.header("x-auth-token");
  let likedGames = [],
    watchList = [];

  if (token) {
    try {
      const decode = jwt.verify(token, process.env.PRIVATE_KEY);
      const User = await UserController.getUserActions(decode._id);
      if (User) {
        likedGames = User.data.liked;
        watchList = User.data.watchList;
      } else {
        return res.status(500).send("Unexpected Error Occurred.");
      }
    } catch (err) {
      return res.status(401).send("Invalid token.");
    }
  }

  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send("Id is not an Valid Object id");

  // Genral Querying the Games
  const result = await StudioController.getById(id);
  if (!result.success)
    return res.status(result.code | 500).send({ message: result.message });

  // updating the game with liked and watched for Logged In user.
  const WatchListId = watchList.map((item) => item.game.toString());

  const UpdatedResult = result.data.gamesId.map((game) => ({
    ...game._doc,
    liked: likedGames.includes(game._id.toString()),
    watched: WatchListId.includes(game._id.toString()),
  }));

  return res.send({ data: { ...result.data._doc, gamesId: UpdatedResult } });
});

// POST - Create an New Studio
routes.post("/", [auth, admin], async (req, res) => {
  const result = await StudioController.addStudio(req.body);
  if (!result.success) {
    res.status(result.code).send({ data: req.body, message: result.message });
  } else {
    res.send({ data: result.data, message: "Data Saved Successfully." });
  }
});

module.exports = routes;
