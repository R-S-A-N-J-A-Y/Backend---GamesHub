const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const routes = express.Router();
const PlatformVController = require("../controllers/PlatformVersion");
const mongoose = require("mongoose");

//GET - to get all the stores with pagination
routes.get("/", async (req, res) => {
  const { page, limit } = req.query;
  const result = await PlatformVController.getAll(page, limit);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

//GET - to get the particular PlatformVersion with id
routes.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send("Id is not an Valid Object id");
  const result = await PlatformVController.getById(id);
  if (!result.success)
    return res.status(result.code | 500).send({ message: result.message });
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
