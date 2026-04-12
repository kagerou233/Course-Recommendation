const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const dbPath =
  process.env.SQLITE_PATH ||
  path.join(__dirname, "..", "data", "app.db");

let db;

function openDb() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const instance = new Database(dbPath);
  instance.pragma("journal_mode = WAL");
  return instance;
}

function initDb() {
  db = openDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const { c } = db.prepare("SELECT COUNT(*) AS c FROM users").get();
  if (c === 0) {
    const hash = bcrypt.hashSync("123456", 10);
    db.prepare(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
    ).run("admin", hash, "admin");
    db.prepare(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
    ).run("user", hash, "user");
  }
}

function getUserById(id) {
  return db
    .prepare(
      "SELECT id, username, role, password_hash FROM users WHERE id = ?"
    )
    .get(id);
}

function getUserByUsername(username) {
  return db
    .prepare(
      "SELECT id, username, role, password_hash FROM users WHERE username = ? COLLATE NOCASE"
    )
    .get(username.trim());
}

function createUser(username, passwordHash, role = "user") {
  const info = db
    .prepare(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
    )
    .run(username.trim(), passwordHash, role);
  return getUserById(info.lastInsertRowid);
}

function userPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    role: row.role,
  };
}

module.exports = {
  initDb,
  getUserById,
  getUserByUsername,
  createUser,
  userPublic,
};
