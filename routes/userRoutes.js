const express = require("express");
const routes = express.Router();

routes.use("/genre", require("./User/Genre"));
routes.use("/tags", require("./User/Tags"));
routes.use("/stores", require("./User/Stores"));

module.exports = routes;
