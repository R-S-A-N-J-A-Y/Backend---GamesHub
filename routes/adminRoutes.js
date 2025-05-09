const express = require("express");
const routes = express.Router();

routes.use("/genre", require("./Admin/Genre"));
routes.use("/tags", require("./Admin/Tags"));

module.exports = routes;
