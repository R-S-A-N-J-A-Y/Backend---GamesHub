const auth = require("../middleware/auth");
const express = require("express");
const routes = express.Router();
const UserController = require("../controllers/User");

// Get - the User Profile
routes.get("/profile", auth, async (req, res) => {
  const id = req.user._id;
  const result = await UserController.getMe(id);
  if (!result.success) return res.status(400).send(result.message);
  return res.send(result.data);
});

routes.get("/watchListPreview", auth, async (req, res) => {
  const UserId = req.user._id;
  const { isTop3 } = req.query;
  const result = await UserController.getWatchlistGames(UserId, isTop3);
  // console.log(result);
  if (result.success) return res.send(result);
  return res.status(401).send(result);
});

routes.get("/cart", auth, async (req, res) => {
  const UserId = req.user._id;
  const result = await UserController.getCart(UserId);
  if (result.success) return res.send(result);
  return res.status(500).send(result);
});

routes.get("/recentlyWatched", auth, async (req, res) => {
  const UserId = req.user._id;
  const { statusCode, success, ...result } =
    await UserController.getUserRecents(UserId);
  return res.status(statusCode).send(result);
});

// Patch - Toggling the Like action
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

// Patch - Toggling the watchList action
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

// Patch - Update an quantity in Cart
routes.patch("/updateCart", auth, async (req, res) => {
  const id = req.user._id;
  console.log(id, req.body.cartId, req.body.isInc, req.body.value);
  const { statusCode, ...result } = await UserController.updateCart(
    id,
    req.body.cartId,
    req.body.value
  );
  return res.status(statusCode).send(result);
});

// POST - Create an Cart
routes.post("/cart", auth, async (req, res) => {
  const id = req.user._id;
  const { statusCode, ...result } = await UserController.CreateCart(
    id,
    req.body.gameId,
    req.body.isInc
  );
  return res.status(statusCode).send(result);
});

// Delete - Delete an Cart
routes.delete("/cart/:id", auth, async (req, res) => {
  const cartId = req.params.id;
  const userId = req.user._id;
  const result = await UserController.deleteCart(userId, cartId);
  return res.status(result.statusCode).send(result.message);
});

module.exports = routes;
