const express = require("express");
const routes = express.Router();
const Tagcontroller = require("../../controllers/Admin/Tags");

routes.post("/", async (req, res) => {
  const result = await Tagcontroller.addTag(req.body);
  if (!result.success) {
    res.status(result.code).send({ data: req.body, message: result.message });
  } else {
    res.send({ data: result.data, message: "Data Saved Successfully." });
  }
});

module.exports = routes;
