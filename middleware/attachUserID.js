// Middleware to verify user is Logged IN and Set the User Id to Body- Authentication

require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(400).send("Access Denied. No token Provided");
  try {
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    req.body = decoded;
    next();
  } catch (err) {
    return res.status(400).send("Invalid token.");
  }
};
