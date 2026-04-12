const neo4j = require("neo4j-driver");
require("dotenv").config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
  {
    encrypted: "ENCRYPTION_OFF", // ⭐ 关键：关闭加密
  }
);

module.exports = driver;
