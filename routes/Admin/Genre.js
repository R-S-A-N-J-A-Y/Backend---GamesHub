const express = require("express");
const routes = express.Router();
const Genrecontroller = require("../../controllers/Admin/Genre");

//GET - to get all the Genre
routes.get("/", async (req, res) => {
  const result = await Genrecontroller.getAll();
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

// POST - Create an New Genre
routes.post("/", async (req, res) => {
  const result = await Genrecontroller.addGenre(req.body);
  if (!result.success) {
    res.status(result.code).send({ data: req.body, message: result.message });
  } else {
    res.send({ data: result.data, message: "Data Saved Successfully." });
  }
});

module.exports = routes;
