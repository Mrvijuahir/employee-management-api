require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models/index");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Welcome to employee leave management");
});

app.use("/api", require("./routers"));

app.use((req, res, next) => {
  res.status(404).json({
    status: false,
    message: "Specified URL cannot be found",
  });
});

app.use((error, req, res, next) => {
  res.status(500).json({
    status: false,
    message: error?.message || "Internal server error",
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to mysql has been esatblished. \u2705\u2705\u2705 "
    );
    app.listen(process.env.PORT, () => {
      console.log(`Server listing on PORT : ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Connection to mysql has been failed. \u274C\u274C\u274C");
  }
}

startServer();
