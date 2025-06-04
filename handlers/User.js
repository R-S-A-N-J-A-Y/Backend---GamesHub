const auth = require("../middleware/auth");
const express = require("express");
const routes = express.Router();
const UserController = require("../controllers/User");

// Get the User Profile
routes.get("/profile", auth, async (req, res) => {
  const id = req.user._id;
  const result = await UserController.getMe(id);
  if (!result.success) return res.status(400).send(result.message);
  return res.send(result.data);
});

routes.get("/watchListPreview", auth, async (req, res) => {
  const UserId = req.user._id;
  const result = await UserController.getTop3WatchlistGames(UserId);
  // console.log(result);
  if (result.success) return res.send(result);
  return res.status(401).send(result);
});

// Toggling the Like action
routes.patch("/toggleLike", auth, async (req, res) => {
  const id = req.user._id;
  const result = await UserController.toggleLike(
    id,
    req.body.gameId,
    req.body.liked
  );
  if (!result.success) return res.status(500).send(result);
  res.send(result);
});

// Toggling the watchList action
routes.patch("/toggleWatchList", auth, async (req, res) => {
  const id = req.user._id;
  const result = await UserController.toggleWatchList(
    id,
    req.body.gameId,
    req.body.watched
  );
  if (!result.success) return res.status(500).send(result);
  res.send(result);
});

routes.patch("/toggleCart", auth, async (req, res) => {
  const id = req.user._id;
  const result = await UserController.toggleCart(
    id,
    req.body.gameId,
    req.body.isAdded
  );
  if (!result.success) return res.status(500).send(result);
  return res.send(result);
});
module.exports = routes;
