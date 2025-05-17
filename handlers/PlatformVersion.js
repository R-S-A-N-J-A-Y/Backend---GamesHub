const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const routes = express.Router();
const PlatformVController = require("../controllers/PlatformVersion");

//GET - to get all the stores with pagination
routes.get("/:id", async (req, res) => {
  const result = await PlatformVController.getAll(req.params.id);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

// POST - Create an New Platform
routes.post("/", [auth, admin], async (req, res) => {
  const result = await PlatformVController.addPlatform(req.body);
  if (!result.success)
    return res.status(result.code || 500).send({ message: result.message });
  else
    return res.send({ data: result.data, message: "Data Saved Successfully." });
});

module.exports = routes;
