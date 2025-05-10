const express = require("express");
const routes = express.Router();

routes.use("/genre", require("./Admin/Genre"));
routes.use("/tags", require("./Admin/Tags"));
routes.use("/stores", require("./Admin/Stores"));
routes.use("/platforms", require("./Admin/Platform"));
routes.use("/platformsv", require("./Admin/PlatformVersion"));
routes.use("/studio", require("./Admin/Studio"));

module.exports = routes;
