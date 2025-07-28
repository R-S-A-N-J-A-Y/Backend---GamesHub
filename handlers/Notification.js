const express = require("express");
const routes = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/Notifications");

routes.get("/", auth, async (req, res) => {
  const { code, ...result } = await controller.getAllNotification(req.user._id);
  return res.status(code).send(result);
});

routes.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { code, ...result } = await controller.getNotification(
    id,
    req.user._id
  );
  return res.status(code).send(result);
});

routes.post("/create", [auth, admin], async (req, res) => {
  const data = req.body;
  if (!data)
    return res.status(400).json({ message: "please Provide the valid data" });
  const { code, ...result } = await controller.createNotification({
    userId: req.user._id,
    ...data,
  });
  return res.status(code).json(result);
});

module.exports = routes;
