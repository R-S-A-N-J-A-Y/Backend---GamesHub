const express = require("express");
const routes = express.Router();
const Tagcontroller = require("../../controllers/Tags");

//GET - to get all the Tags
routes.get("/:id", async (req, res) => {
  const result = await Tagcontroller.getAll(req.params.id);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

// POST - Create an New Tag
routes.post("/", async (req, res) => {
  const result = await Tagcontroller.addTag(req.body);
  if (!result.success) {
    res.status(result.code).send({ data: req.body, message: result.message });
  } else {
    res.send({ data: result.data, message: "Data Saved Successfully." });
  }
});

module.exports = routes;
