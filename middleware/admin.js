module.exports = (req, res, next) => {
  const { role } = req.user;
  if (role !== "admin") return res.status(403).send("Access denied.");
  next();
};
