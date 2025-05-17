const express = require("express");
const routes = express.Router();

const AuthController = require("../auth/authHandler");

routes.get("/", AuthController.GetAllUser);
routes.post("/login", AuthController.Login);
routes.post("/register", AuthController.Register);

module.exports = routes;
