const express = require("express");
const routes = express.Router();

const AuthController = require("../auth/authHandler");
const auth = require("../middleware/auth");

routes.get("/", AuthController.GetAllUser);
routes.get("/verifyToken", auth, (req, res) => {
  return res.json({
    valid: true,
    user: req.user,
  });
});
routes.post("/login", AuthController.Login);
routes.post("/register", AuthController.Register);

module.exports = routes;
