const authId = require("../middleware/attachUserID");
const express = require("express");
const routes = express.Router();
const UserController = require("../controllers/User");

routes.get("/", authId, async (req, res) => {
  const id = req.body._id;
  const result = await UserController.getMe(id);
  if (!result.success) return res.status(400).send(result.message);
  return res.send(result.data);
});

module.exports = routes;
