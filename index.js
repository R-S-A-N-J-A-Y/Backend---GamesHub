const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./config/dbconfig");
connectDB();

app.use(cors());
app.use(express.json());
app.use("/admin", require("./routes/adminRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => console.log("Server is running on port 3000...."));
