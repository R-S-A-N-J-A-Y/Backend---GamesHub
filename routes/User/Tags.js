const express = require("express");
const routes = express.Router();
const Tagcontroller = require("../../controllers/Tags");

//GET - to get all the Tags
routes.get("/:id", async (req, res) => {
  const result = await Tagcontroller.getAll(req.params.id);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

module.exports = routes;
