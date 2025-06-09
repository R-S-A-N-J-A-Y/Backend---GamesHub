const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const express = require("express");
const routes = express.Router();
const mongoose = require("mongoose");

const GameController = require("../controllers/Game");

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

routes.get("/filter", async (req, res) => {
  const { platforms, sortBy, order } = req.query;
  const { statusCode, ...result } = await GameController.getByFilters(
    platforms,
    sortBy,
    order
  );
  res.status(statusCode).send(result);
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
