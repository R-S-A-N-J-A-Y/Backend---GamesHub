const express = require("express");
const routes = express.Router();

routes.use("/genre", require("../handlers/Genre"));
routes.use("/tags", require("../handlers/Tags"));
routes.use("/stores", require("../handlers/Stores"));
routes.use("/platforms", require("../handlers/Platform"));
routes.use("/platformsv", require("../handlers/PlatformVersion"));
routes.use("/studio", require("../handlers/Studio"));

module.exports = routes;
