const express = require("express");
const routes = express.Router();

routes.use("/genres", require("../handlers/Genre"));
routes.use("/tags", require("../handlers/Tags"));
routes.use("/stores", require("../handlers/Stores"));
routes.use("/platforms", require("../handlers/Platform"));
routes.use("/platformsv", require("../handlers/PlatformVersion"));
routes.use("/studios", require("../handlers/Studio"));
routes.use("/games", require("../handlers/Game"));
routes.use("/notifications", require("../handlers/Notification"));

module.exports = routes;
