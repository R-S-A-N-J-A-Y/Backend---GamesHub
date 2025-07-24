const express = require("express");
const routes = express.Router();

const auth = require("../middleware/auth");

const controller = require("../controllers/Notifications");

routes.get("/", async (req, res) => {
  const { code, ...result } = await controller.getAllNotification();
  console.log(code);
  return res.status(code).send(result);
});

routes.post("/create", [auth], async (req, res) => {
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
