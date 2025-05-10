const express = require("express");
const routes = express.Router();
const Genrecontroller = require("../../controllers/Genre");

//GET - to get all the Genre with Pagination
routes.get("/:id", async (req, res) => {
  const result = await Genrecontroller.getAll(req.params.id);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

module.exports = routes;
