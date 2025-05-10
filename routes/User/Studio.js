const express = require("express");
const routes = express.Router();
const Studiocontroller = require("../../controllers/User/Studio");

//GET - to get all the Studios
routes.get("/:id", async (req, res) => {
  const result = await Studiocontroller.getAll(req.params.id);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result.data });
});

module.exports = routes;
