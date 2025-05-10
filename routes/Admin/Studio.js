const express = require("express");
const routes = express.Router();
const Studiocontroller = require("../../controllers/Admin/Studio");

//GET - to get all the Studios
routes.get("/:id", async (req, res) => {
  const result = await Studiocontroller.getAll(req.params.id);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

// POST - Create an New Studio
routes.post("/", async (req, res) => {
  const result = await Studiocontroller.addStudio(req.body);
  if (!result.success) {
    res.status(result.code).send({ data: req.body, message: result.message });
  } else {
    res.send({ data: result.data, message: "Data Saved Successfully." });
  }
});

module.exports = routes;
