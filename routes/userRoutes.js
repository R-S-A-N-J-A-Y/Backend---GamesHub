const express = require("express");
const routes = express.Router();

routes.use("/genre", require("./User/Genre"));
routes.use("/tags", require("./User/Tags"));
routes.use("/stores", require("./User/Stores"));
routes.use("/platforms", require("./User/Platform"));
routes.use("/platformsv", require("./User/PlatformVersion"));

module.exports = routes;
