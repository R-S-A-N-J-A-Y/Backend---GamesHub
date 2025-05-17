const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const routes = express.Router();
const mongoose = require("mongoose");

const GameController = require("../controllers/Game");

//GET - to get all the Games with pagination
routes.get("/", async (req, res) => {
  const { page, limit } = req.query;
  const result = await GameController.getAll(page, limit);
  if (!result.success) return res.status(500).send(result);
  return res.send(result);
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
routes.post("/", [auth, admin], async (req, res) => {
  const result = await GameController.createGame(req.body);
  if (!result.success) return res.status(result.code | 500).send(result);
  return res.send(result);
});

module.exports = routes;
