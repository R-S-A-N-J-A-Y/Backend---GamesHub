require("dotenv").config();
const mongoose = require("mongoose");

const Username = process.env.MONGO_USERNAME;
const Password = process.env.MONGO_PASSWORD;
const ClusterURL = process.env.MONGO_CLUSTER_URL;
const Dbname = process.env.MONGO_DB_NAME;

const connectDB = () => {
  mongoose
    .connect(
      `mongodb+srv://${Username}:${Password}@${ClusterURL}.mongodb.net/${Dbname}`
    )
    .then(() => console.log("Connected to DB..."))
    .catch((err) => console.log("Error Detected: ", err));
};

module.exports = connectDB;
