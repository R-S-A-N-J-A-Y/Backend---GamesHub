const express = require("express");
const app = express();

const connectDB = require("./config/dbconfig");
connectDB();

app.use(express.json());
app.use("/admin", require("./routes/adminRoutes"));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => console.log("Server is running on port 3000...."));
