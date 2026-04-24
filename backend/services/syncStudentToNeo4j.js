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

/**
 * 注册后同步 Student，支持写入注册时间和基础档案信息。
 */
async function upsertStudentProfile({
  id,
  username,
  school = "",
  gender = "",
  createdAt,
}) {
  if (id == null || !username) return;

  const session = driver.session();
  const studentId = neo4j.int(Number(id));
  const normalizedCreatedAt =
    createdAt && String(createdAt).trim()
      ? String(createdAt).trim().replace("T", " ").replace("Z", "")
      : new Date().toISOString().replace("T", " ").slice(0, 19);

  try {
    const normalizedSchool = String(school || "").trim();
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
      SET
        s.name = $name,
        s.username = $name,
        s.created_at = coalesce(s.created_at, $created_at),
        s.school = CASE WHEN $school <> '' THEN $school ELSE s.school END,
        s.gender = CASE WHEN $gender <> '' THEN $gender ELSE s.gender END
      RETURN s
      `,
      {
        student_id: studentId,
        name: username,
        created_at: normalizedCreatedAt,
        last_login: "未登录",
        school: normalizedSchool,
        gender: String(gender || ""),
      },
    );

    // 为学校创建节点并维护 STUDY_AT 关系，便于图路径查询
    if (normalizedSchool) {
      await session.run(
        `
        MATCH (s:Student { student_id: $student_id })
        OPTIONAL MATCH (s)-[old:STUDY_AT]->(:School)
        DELETE old
        WITH s
        MERGE (sch:School { name: $school })
        MERGE (s)-[:STUDY_AT]->(sch)
        `,
        {
          student_id: studentId,
          school: normalizedSchool,
        },
      );
    }
  } finally {
    await session.close();
  }
}

/**
 * 查询学生资料是否完整（学校 + 性别）。
 */
async function getStudentProfileStatus({ id }) {
  if (id == null) {
    return { exists: false, profileCompleted: false };
  }

  const session = driver.session();
  const studentIdInt = Number.parseInt(id, 10);
  const studentIdStr = String(id);

  try {
    const result = await session.run(
      `
      MATCH (s:Student)
      WHERE s.student_id = $student_id_int OR s.id = $student_id_int OR toString(s.student_id) = $student_id_str OR toString(s.id) = $student_id_str
      OPTIONAL MATCH (s)-[:STUDY_AT]->(sch:School)
      RETURN s, sch
      LIMIT 1
      `,
      {
        student_id_int: Number.isNaN(studentIdInt) ? -1 : studentIdInt,
        student_id_str: studentIdStr,
      },
    );

    if (result.records.length === 0) {
      return { exists: false, profileCompleted: false };
    }

    const props = result.records[0].get("s").properties || {};
    const schNode = result.records[0].get("sch");
    const schoolFromNode =
      schNode && schNode.properties ? schNode.properties.name : "";
    const school = (props.school || schoolFromNode || "").toString().trim();
    const gender = (props.gender || "").toString().trim();

    return {
      exists: true,
      profileCompleted: Boolean(school && gender),
      school,
      gender,
      created_at: props.created_at || null,
    };
  } finally {
    await session.close();
  }
}

module.exports = {
  syncRegisteredStudent,
  upsertStudentProfile,
  getStudentProfileStatus,
};
