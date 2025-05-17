const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const routes = express.Router();
const StoreController = require("../controllers/Store");
const mongoose = require("mongoose");

//GET - to get all the stores with pagination
routes.get("/", async (req, res) => {
  const { page, limit } = req.query;
  const result = await StoreController.getAll(page, limit);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

//GET - to get the particular Genre with id
routes.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send("Id is not an Valid Object id");
  const result = await StoreController.getById(id);
  if (!result.success)
    return res.status(result.code | 500).send({ message: result.message });
  return res.send({ data: result.data });
});

// POST - Create an New Stores
routes.post("/", [auth, admin], async (req, res) => {
  const result = await StoreController.addStore(req.body);
  if (!result.success)
    return res
      .status(result.code)
      .send({ data: req.body, message: result.message });
  else
    return res.send({ data: result.data, message: "Data Saved Successfully." });
});

module.exports = routes;
