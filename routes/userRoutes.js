const express = require("express");
const routes = express.Router();

routes.use("/genre", require("./User/Genre"));
routes.use("/tags", require("./User/Tags"));
routes.use("/stores", require("./User/Stores"));
routes.use("/platforms", require("./User/Platform"));
routes.use("/platformsv", require("./User/PlatformVersion"));
routes.use("/studio", require("./User/Studio"));

// User Query

const userController = require("../controllers/User");

routes.get("/", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = await userController.getUser(email, password);
  if (!result.success) return res.send(result);
  res.send({ data: result.data });
});

routes.post("/", async (req, res) => {
  const result = await userController.createUser(req.body);
  if (!result.success)
    return res
      .status(result.code | 500)
      .send({ data: req.body, message: result.message });
  return res.send({ data: result.data, message: "User Saved Sucessfully" });
});

module.exports = routes;
