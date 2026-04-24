const express = require("express");
const bcrypt = require("bcryptjs");
const {
  getUserById,
  getUserByUsername,
  createUser,
  userPublic,
} = require("../db/sqlite");
const {
  upsertStudentProfile,
  getStudentProfileStatus,
} = require("../services/syncStudentToNeo4j");

const router = express.Router();

function generateToken(user) {
  return Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      timestamp: Date.now(),
    })
  ).toString("base64");
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "未提供认证token" });
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    const row = getUserById(decoded.id);

    if (!row) {
      return res.status(401).json({ message: "无效的token" });
    }

    req.user = userPublic(row);
    next();
  } catch {
    return res.status(401).json({ message: "无效的token" });
  }
}

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "用户名和密码不能为空" });
  }

  const u = String(username).trim();
  if (u.length < 2 || u.length > 32) {
    return res.status(400).json({ message: "用户名长度为 2～32 个字符" });
  }

  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(u)) {
    return res
      .status(400)
      .json({ message: "用户名仅支持字母、数字、下划线与中文" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "密码长度不能少于6位" });
  }

  if (getUserByUsername(u)) {
    return res.status(409).json({ message: "用户名已被注册" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const row = createUser(u, passwordHash, "user");
  const safe = userPublic(row);
  const token = generateToken(safe);

  try {
    await upsertStudentProfile({
      id: safe.id,
      username: safe.username,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error("[Neo4j] 注册后同步 Student 失败:", err.message || err);
  }

  res.status(201).json({
    message: "注册成功",
    token,
    user: safe,
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "用户名和密码不能为空" });
  }

  const row = getUserByUsername(username);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ message: "用户名或密码错误" });
  }

  const safe = userPublic(row);
  const token = generateToken(safe);
  let profileCompleted = true;

  if (safe.role !== "admin") {
    try {
      const status = await getStudentProfileStatus({ id: safe.id });
      profileCompleted = status.profileCompleted;
    } catch (err) {
      console.error("[Neo4j] 登录时查询资料状态失败:", err.message || err);
      profileCompleted = false;
    }
  }

  res.json({
    message: "登录成功",
    token,
    user: {
      ...safe,
      profileCompleted,
    },
  });
});

router.get("/profile", verifyToken, (req, res) => {
  res.json({
    user: req.user,
  });
});

router.get("/student-profile/status", verifyToken, async (req, res) => {
  if (req.user.role === "admin") {
    return res.json({
      success: true,
      data: { exists: true, profileCompleted: true },
    });
  }

  try {
    const status = await getStudentProfileStatus({ id: req.user.id });
    return res.json({
      success: true,
      data: status,
    });
  } catch (err) {
    console.error("[Neo4j] 查询学生资料状态失败:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "查询资料状态失败",
    });
  }
});

router.post("/student-profile", verifyToken, async (req, res) => {
  if (req.user.role === "admin") {
    return res.status(400).json({
      success: false,
      message: "管理员无需填写学生资料",
    });
  }

  const school = String((req.body && req.body.school) || "").trim();
  const gender = String((req.body && req.body.gender) || "").trim();

  if (!school) {
    return res.status(400).json({
      success: false,
      message: "学校不能为空",
    });
  }

  if (!["男", "女", "其他"].includes(gender)) {
    return res.status(400).json({
      success: false,
      message: "性别仅支持 男/女/其他",
    });
  }

  const row = getUserById(req.user.id);
  if (!row) {
    return res.status(404).json({
      success: false,
      message: "用户不存在",
    });
  }

  try {
    await upsertStudentProfile({
      id: row.id,
      username: row.username,
      createdAt: row.created_at,
      school,
      gender,
    });

    return res.json({
      success: true,
      message: "学生资料保存成功",
      data: {
        school,
        gender,
        created_at: row.created_at,
        profileCompleted: true,
      },
    });
  } catch (err) {
    console.error("[Neo4j] 保存学生资料失败:", err.message || err);
    return res.status(500).json({
      success: false,
      message: "保存学生资料失败",
    });
  }
});

router.post("/logout", verifyToken, (req, res) => {
  res.json({ message: "退出登录成功" });
});

module.exports = router;
