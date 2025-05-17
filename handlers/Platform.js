const auth = require("../middleware/auth");
const express = require("express");
const routes = express.Router();
const PlatformController = require("../controllers/Platform");

//GET - to get all the stores with pagination
routes.get("/:id", async (req, res) => {
  const result = await PlatformController.getAll(req.params.id);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

// POST - Create an New Platform
routes.post("/", auth, async (req, res) => {
  const result = await PlatformController.addPlatform(req.body);
  if (!result.success)
    return res.status(result.code).send({ message: result.message });
  else
    return res.send({ data: result.data, message: "Data Saved Successfully." });
});

module.exports = routes;
