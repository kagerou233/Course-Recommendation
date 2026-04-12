const neo4j = require("neo4j-driver");
const driver = require("../config/neo4j");

/**
 * 注册成功后同步一条 Student 节点，与 neo4j.controller getUsers / deleteUser 约定一致。
 */
async function syncRegisteredStudent({ id, username }) {
  if (id == null || !username) return;

  const session = driver.session();
  const studentId = neo4j.int(Number(id));
  const createdAt = new Date().toISOString().replace("T", " ").slice(0, 19);

  try {
    await session.run(
      `
      MERGE (s:Student { student_id: $student_id })
      ON CREATE SET
        s.id = $student_id,
        s.name = $name,
        s.username = $name,
        s.created_at = $created_at,
        s.login_count = 0,
        s.last_login = $last_login
      SET s.name = $name, s.username = $name
      `,
      {
        student_id: studentId,
        name: username,
        created_at: createdAt,
        last_login: "未登录",
      }
    );
  } finally {
    await session.close();
  }
}

module.exports = { syncRegisteredStudent };
