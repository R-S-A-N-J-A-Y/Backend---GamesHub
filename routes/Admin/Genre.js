const express = require("express");
const routes = express.Router();
const Genrecontroller = require("../../controllers/Admin/Genre");

routes.post("/", async (req, res) => {
  const result = await Genrecontroller.addGenre(req.body);
  if (!result.success) {
    res.status(result.code).send({ data: req.body, message: result.message });
  } else {
    res.send({ data: result.data, message: "Data Saved Successfully." });
  }
});

module.exports = routes;
