const express = require("express");
const routes = express.Router();
const StoreController = require("../../controllers/Admin/Store");

//GET - to get all the stores
routes.get("/", async (req, res) => {
  const result = await StoreController.getAll();
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
