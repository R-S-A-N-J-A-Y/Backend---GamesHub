const express = require("express");
const routes = express.Router();
const PlatformController = require("../../controllers/Admin/Platform");

routes.get("/:id", async (req, res) => {
  const result = await PlatformController.getAll(req.params.id);
  if (!result.success) return res.status(500).send({ message: err.message });
  return res.send({ data: result.data });
});

module.exports = routes;
