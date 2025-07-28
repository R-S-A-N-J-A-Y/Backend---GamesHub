require("dotenv").config();
const jwt = require("jsonwebtoken");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const express = require("express");
const routes = express.Router();
const mongoose = require("mongoose");

const GameController = require("../controllers/Game");
const UserController = require("../controllers/User");

//GET - to get all the Games with pagination also It will handle both Guest and Logged User.
routes.get("/", async (req, res) => {
  const token = req.header("x-auth-token");
  const { page, limit, sortBy, order } = req.query;

  if (token) {
    // Function for Log in User.
    const { statusCode, ...result } = await GameController.getAllwithUserMeta(
      token,
      page,
      limit,
      sortBy,
      order
    );
    return res.status(statusCode).send(result);
  }

  // Genral Querying the Games - Guest User
  const { statusCode, ...result } = await GameController.getAll(
    page,
    limit,
    sortBy,
    order
  );
  res.status(statusCode).send(result);
});

// GET - to filter the game by platforms and sort by
routes.get("/filter", async (req, res) => {
  const { platforms, sortBy, order } = req.query;
  const { statusCode, ...result } = await GameController.getByFilters(
    platforms,
    sortBy,
    order
  );
  res.status(statusCode).send(result);
});

// GET - get the games by genres
routes.get("/genres", async (req, res) => {
  const genresParam = req.query.genres;
  const genres = Array.isArray(genresParam) ? genresParam : [genresParam];

  const genreIds = genres
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const { statusCode, ...result } = await GameController.getGamesByGenre(
    genreIds
  );
  res.status(statusCode).send(result);
});

//GET - to get the particular Game with id
routes.get("/:id", async (req, res) => {
  const gameId = req.params.id;

  const token = req.header("x-auth-token");

  if (!mongoose.Types.ObjectId.isValid(gameId))
    return res.status(400).send("Id is not an Valid Object id");

  if (token) {
    return res.send(
      await GameController.getGameByIdWithUserMeta(token, gameId)
    );
  }

  const { statusCode, ...result } = await GameController.getById(gameId);
  if (!result.success) return res.status(statusCode | 500).send(result);

  return res.send(result);
});

routes.put("/", [auth, admin], async (req, res) => {
  const { gameId, data } = req.body;
  const { _id } = req.user;
  if (!data || !gameId)
    return res
      .status(400)
      .json({ success: false, message: "No data to be Applied.." });
  const { code, ...result } = await GameController.UpdateGame(
    gameId,
    _id,
    data
  );
  return res.status(code).json(result);
});

//POST - create an New Game
routes.post("/", [auth, admin], async (req, res) => {
  const result = await GameController.createGame(req.user._id, req.body);
  if (!result.success) return res.status(result.code || 500).send(result);
  return res.status(201).send(result);
});

module.exports = routes;
