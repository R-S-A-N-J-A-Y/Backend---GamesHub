const express = require("express");
const routes = express.Router();
const StoreController = require("../../controllers/User/Store");

//GET - to get all the stores with pagination
routes.get("/:id", async (req, res) => {
  const result = await StoreController.getAll(req.params.id);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result });
});

module.exports = routes;
