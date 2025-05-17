const auth = require("../middleware/auth");
const express = require("express");
const routes = express.Router();

const GameController = require("../controllers/Game");

routes.get("/", async (req, res) => {
  const result = await GameController.getAll();
  if (!result.success) return res.status(500).send(result);
  return res.send(result);
});

routes.post("/", auth, async (req, res) => {
  const result = await GameController.createGame(req.body);
  if (!result.success) return res.status(result.code | 500).send(result);
  return res.send(result);
});

module.exports = routes;
