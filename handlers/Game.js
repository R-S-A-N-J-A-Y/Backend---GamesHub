require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const express = require("express");
const routes = express.Router();
const mongoose = require("mongoose");

const GameController = require("../controllers/Game");
const UserController = require("../controllers/User");

//GET - to get all the Games with pagination
// It will handle both Guest and Logged User.
routes.get("/", async (req, res) => {
  // Token for Log in User.
  const token = req.header("x-auth-token");
  let likedGames = [];
  let watchList = [];
  if (token) {
    try {
      const decode = jwt.verify(token, process.env.PRIVATE_KEY);
      const User = await UserController.getUserActions(decode._id);
      if (User.success) {
        likedGames = User.data.liked;
        watchList = User.data.watchList;
      } else {
        return res.status(500).send("Unexpected Error Occurred.");
      }
    } catch (err) {
      return res.status(401).send("Invalid token.");
    }
  }

  // Genral Querying the Games
  const { page, limit } = req.query;
  const result = await GameController.getAll(page, limit);
  if (!result.success) return res.status(500).send(result);

  // Updating for Log in User
  const UpdatedResult = result.data.map((game) => ({
    ...game._doc,
    liked: likedGames.includes(game._id.toString()),
    watched: watchList.includes(game._id.toString()),
  }));

  return res.send({ ...result, data: UpdatedResult });
});

//GET - to get the particular Game with id
routes.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send("Id is not an Valid Object id");
  const result = await GameController.getById(req.params.id);
  if (!result.success)
    return res.status(result.code | 500).send({ message: result.message });
  return res.send({ data: result.data });
});

//POST - create an New Game
routes.post("/", async (req, res) => {
  const result = await GameController.createGame(req.body);
  console.log(result);
  if (!result.success) return res.status(result.code | 500).send(result);
  return res.send(result);
});

module.exports = routes;
