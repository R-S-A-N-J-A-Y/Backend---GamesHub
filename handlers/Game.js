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
  const watchListGameIds = watchList.map((item) => item.game.toString());

  const UpdatedResult = result.data.map((game) => ({
    ...game._doc,
    liked: likedGames.includes(game._id.toString()),
    watched: watchListGameIds.includes(game._id.toString()),
  }));

  return res.send({ ...result, data: UpdatedResult });
});

//GET - to get the particular Game with id
routes.get("/:id", async (req, res) => {
  const gameId = req.params.id;

  const token = req.header("x-auth-token");
  let isIncart = "";

  if (token) {
    try {
      const decode = jwt.verify(token, process.env.PRIVATE_KEY);
      const UserCart = await UserController.getUserCart(decode._id);
      if (!UserCart.success) return res.status(401).send(result.message);
      isIncart = UserCart.data.cart.find(
        (obj) => obj.game.toString() === gameId
      );
    } catch (err) {
      console.log(err);
      return res.status(401).send("Invalid token.");
    }
  }

  if (!mongoose.Types.ObjectId.isValid(gameId))
    return res.status(400).send("Id is not an Valid Object id");

  const result = await GameController.getById(gameId);
  if (!result.success)
    return res.status(result.code | 500).send({ message: result.message });

  const UpdatedGame = {
    ...result.data._doc,
    isInCart: isIncart ? true : false,
  };

  return res.send({ data: UpdatedGame });
});

//POST - create an New Game
routes.post("/", [auth, admin], async (req, res) => {
  const result = await GameController.createGame(req.body);
  console.log(result);
  if (!result.success) return res.status(result.code | 500).send(result);
  return res.send(result);
});

module.exports = routes;
