require("dotenv").config();
const express = require("express");
const { initDb } = require("./db/sqlite");
const neo4jRoutes = require("./routes/neo4j.routes");
const authRoutes = require("./routes/auth.routes");

initDb();

const app = express();

// 添加CORS支持
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// API 路由
app.use("/api/neo4j", neo4jRoutes);
app.use("/api/auth", authRoutes);

// 启动
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
