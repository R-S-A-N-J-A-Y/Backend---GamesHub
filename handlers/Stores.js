const express = require("express");
const routes = express.Router();
const StoreController = require("../controllers/Store");

//GET - to get all the stores with pagination
routes.get("/:id", async (req, res) => {
  const result = await StoreController.getAll(req.params.id);
  if (!result.success) return res.status(500).send({ message: result.message });
  return res.send({ data: result });
});

// POST - Create an New Stores
routes.post("/", async (req, res) => {
  const result = await StoreController.addStore(req.body);
  if (!result.success)
    return res
      .status(result.code)
      .send({ data: req.body, message: result.message });
  else
    return res.send({ data: result.data, message: "Data Saved Successfully." });
});

module.exports = routes;
