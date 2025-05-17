const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const routes = express.Router();
const GenreController = require("../controllers/Genre");
const mongoose = require("mongoose");

//GET - to get all the Genre with Pagination
routes.get("/", async (req, res) => {
  const { page, limit } = req.query;
  const result = await GenreController.getAll(page, limit);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

//GET - to get the particular Genre with id
routes.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send("Id is not an Valid Object id");
  const result = await GenreController.getById(id);
  if (!result.success)
    return res.status(result.code | 500).send({ message: result.message });
  return res.send({ data: result.data });
});

// POST - Create an New Genre
routes.post("/", [auth, admin], async (req, res) => {
  const result = await GenreController.addGenre(req.body);
  if (!result.success) {
    res.status(result.code).send({ data: req.body, message: result.message });
  } else {
    res.send({ data: result.data, message: "Data Saved Successfully." });
  }
});

module.exports = routes;
