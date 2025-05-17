const express = require("express");
const routes = express.Router();

routes.use("/genre", require("../handlers/Genre"));
routes.use("/tags", require("../handlers/Tags"));
routes.use("/stores", require("../handlers/Stores"));
routes.use("/platforms", require("../handlers/Platform"));
routes.use("/platformsv", require("../handlers/PlatformVersion"));
routes.use("/studio", require("../handlers/Studio"));
routes.use("/game", require("../handlers/Game"));

// User Query
const userController = require("../controllers/User");

routes.get("/", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = await userController.getUser(email, password);
  if (!result.success) return res.status(404).send(result);
  res.send(result);
});

routes.post("/", async (req, res) => {
  const countryCode = req.query.countryCode;
  const result = await userController.createUser(req.body, countryCode);
  if (!result.success)
    return res
      .status(result.code | 500)
      .send({ message: result.message, data: req.body });
  return res.send(result);
});

module.exports = routes;
