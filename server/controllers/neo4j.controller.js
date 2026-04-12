const driver = require("../config/neo4j");

/**
 * 辅助函数：转换 Neo4j Integer 为 JavaScript Number
 */
function toNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (value.toNumber) return value.toNumber();
  if (value.low !== undefined) {
    const neo4j = require("neo4j-driver");
    return neo4j.int(value.low, value.high).toNumber();
  }
  return parseInt(value);
}

/**
 * 格式化日期时间
 * 将 Neo4j DateTime 或 ISO 字符串转换为 "YYYY-MM-DD HH:mm:ss" 格式
 */
function formatDateTime(dateValue) {
  if (!dateValue) return null;

  try {
    let date;

    // 处理 Neo4j DateTime 对象
    if (dateValue.year && dateValue.month && dateValue.day) {
      date = new Date(
        dateValue.year.toNumber ? dateValue.year.toNumber() : dateValue.year,
        (dateValue.month.toNumber
          ? dateValue.month.toNumber()
          : dateValue.month) - 1,
        dateValue.day.toNumber ? dateValue.day.toNumber() : dateValue.day,
        dateValue.hour?.toNumber
          ? dateValue.hour.toNumber()
          : dateValue.hour || 0,
        dateValue.minute?.toNumber
          ? dateValue.minute.toNumber()
          : dateValue.minute || 0,
        dateValue.second?.toNumber
          ? dateValue.second.toNumber()
          : dateValue.second || 0,
      );
    }
    // 处理字符串格式
    else if (typeof dateValue === "string") {
      date = new Date(dateValue);
    }
    // 处理 Date 对象
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    // 处理 toString() 方法
    else if (dateValue.toString) {
      date = new Date(dateValue.toString());
    } else {
      return null;
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return null;
    }

    // 格式化为 "YYYY-MM-DD HH:mm:ss"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return null;
  }
}

/**
 * 生成课程默认图片URL
 * 使用精选的科技感图片ID列表
 */
function generateCourseImage(courseId) {
  const techImageIds = [
    0, 1, 20, 48, 60, 77, 119, 152, 160, 180, 201, 225, 250, 274, 326, 367, 403,
    430, 452, 478, 500, 582, 593, 684, 718, 783, 815, 870, 901, 1003, 1015,
    1025, 1040, 1060, 1074,
  ];

  // 根据课程ID选择图片（确保同一课程总是相同图片）
  const numericId =
    typeof courseId === "string" ? parseInt(courseId) || 0 : courseId;
  const imageId = techImageIds[Math.abs(numericId) % techImageIds.length];

  return `https://picsum.photos/id/${imageId}/300/200`;
}

/**
 * 映射课程数据
 */
function mapCourseData(course) {
  // 安全地转换 Neo4j Integer 类型
  const toNumber = (value) => {
    if (value == null) return null;
    if (typeof value === "number") return value;
    if (value.toNumber) return value.toNumber();
    if (value.low !== undefined) return value.low;
    return parseInt(value) || null;
  };

  const courseId = toNumber(course.course_id || course.id);
  const title = course.name || course.title || "未命名课程";

  return {
    id: courseId,
    title: title,
    description: course.description || "暂无描述",
    createTime: formatDateTime(course.created_at),
    publishTime: formatDateTime(course.published_at),
    views: toNumber(course.visits) || 0,
    category: course.category || "未分类",
    type: course.type || "课程",
    level: course.level || "中级",
    duration: course.duration || "未知",
    status: course.status || "已发布",
    rating: course.rating ? parseFloat(course.rating) : 0,
    image: course.image || generateCourseImage(courseId),
  };
}

/**
 * 创建 User 节点
 */
exports.createUser = async (req, res) => {
  const { name, age } = req.body;
  const session = driver.session();

  try {
    await session.run("CREATE (u:User {name: $name, age: $age})", {
      name,
      age,
    });
    res.json({ message: "User created" });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    await session.close();
  }
};

/**
 * 查询所有 User
 */
exports.getAllUsers = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run("MATCH (u:User) RETURN u");
    res.json(result.records.map((r) => r.get("u").properties));
  } finally {
    await session.close();
  }
};

/**
 * 根据 name 查询 User
 */
exports.getUserByName = async (req, res) => {
  const { name } = req.params;
  const session = driver.session();

  try {
    const result = await session.run("MATCH (u:User {name: $name}) RETURN u", {
      name,
    });
    if (result.records.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.records[0].get("u").properties);
  } finally {
    await session.close();
  }
};

/**
 * 更新 User
 */
exports.updateUser = async (req, res) => {
  const { name, age } = req.body;
  const session = driver.session();

  try {
    await session.run("MATCH (u:User {name: $name}) SET u.age = $age", {
      name,
      age,
    });
    res.json({ message: "User updated" });
  } finally {
    await session.close();
  }
};

/**
 * 删除 User
 */
exports.deleteUser = async (req, res) => {
  const { name } = req.params;
  const session = driver.session();

  try {
    await session.run("MATCH (u:User {name: $name}) DETACH DELETE u", { name });
    res.json({ message: "User deleted" });
  } finally {
    await session.close();
  }
};

/**
 * 创建 FRIEND 关系
 */
exports.createFriendRelation = async (req, res) => {
  const { from, to } = req.body;
  const session = driver.session();

  try {
    await session.run(
      `
      MATCH (a:User {name: $from})
      MATCH (b:User {name: $to})
      CREATE (a)-[:FRIEND]->(b)
      `,
      { from, to },
    );
    res.json({ message: "Relation created" });
  } finally {
    await session.close();
  }
};

/**
 * 查询所有关系
 */
exports.getAllRelations = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (a)-[r]->(b)
      RETURN a.name AS from, type(r) AS relation, b.name AS to
      `,
    );
    res.json(
      result.records.map((r) => ({
        from: r.get("from"),
        relation: r.get("relation"),
        to: r.get("to"),
      })),
    );
  } finally {
    await session.close();
  }
};

/**
 * 获取所有课程信息
 */
exports.getAllCourses = async (req, res) => {
  const session = driver.session();

  try {
    // 如果没有分页参数，返回所有数据（前端分页）
    if (!req.query.page && !req.query.pageSize) {
      const result = await session.run("MATCH (c:Course) RETURN c");
      const courses = result.records.map((r) =>
        mapCourseData(r.get("c").properties),
      );

      // 使用自定义序列化处理 BigInt
      const jsonString = JSON.stringify(courses, (key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      );
      res.setHeader("Content-Type", "application/json");
      return res.send(jsonString);
    }

    // 如果有分页参数，返回分页数据（后端分页）
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    // 获取总数
    const countResult = await session.run(
      "MATCH (c:Course) RETURN count(c) as total",
    );
    const total = countResult.records[0].get("total").toNumber();

    // 获取分页数据 - 使用 neo4j.int() 确保是整数
    const neo4j = require("neo4j-driver");
    const result = await session.run(
      `
      MATCH (c:Course)
      RETURN c
      ORDER BY c.created_at DESC
      SKIP $skip
      LIMIT $limit
      `,
      {
        skip: neo4j.int(skip),
        limit: neo4j.int(pageSize),
      },
    );

    const courses = result.records.map((r) =>
      mapCourseData(r.get("c").properties),
    );

    // 返回分页数据
    res.json({
      data: courses,
      pagination: {
        page: page,
        pageSize: pageSize,
        total: total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (e) {
    console.error("Error fetching courses:", e);
    res.status(500).json({ error: e.message });
  } finally {
    await session.close();
  }
};

/**
 * 根据分类获取课程
 */
exports.getCoursesByCategory = async (req, res) => {
  const { category } = req.params;
  const session = driver.session();

  try {
    // 如果没有分页参数，返回所有数据
    if (!req.query.page && !req.query.pageSize) {
      const result = await session.run(
        `
        MATCH (c:Course)
        WHERE c.category = $category
        RETURN c
        `,
        { category },
      );

      const courses = result.records.map((r) =>
        mapCourseData(r.get("c").properties),
      );
      return res.json(courses);
    }

    // 如果有分页参数，返回分页数据
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    // 获取总数
    const countResult = await session.run(
      `
      MATCH (c:Course)
      WHERE c.category = $category
      RETURN count(c) as total
      `,
      { category },
    );
    const total = countResult.records[0].get("total").toNumber();

    // 获取分页数据 - 使用 neo4j.int() 确保是整数
    const neo4j = require("neo4j-driver");
    const result = await session.run(
      `
      MATCH (c:Course)
      WHERE c.category = $category
      RETURN c
      ORDER BY c.created_at DESC
      SKIP $skip
      LIMIT $limit
      `,
      {
        category,
        skip: neo4j.int(skip),
        limit: neo4j.int(pageSize),
      },
    );

    const courses = result.records.map((r) =>
      mapCourseData(r.get("c").properties),
    );

    // 返回分页数据
    res.json({
      data: courses,
      pagination: {
        page: page,
        pageSize: pageSize,
        total: total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (e) {
    console.error("Error fetching courses by category:", e);
    res.status(500).json({ error: e.message });
  } finally {
    await session.close();
  }
};

/**
 * 删除课程
 */
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  const session = driver.session();

  try {
    // 删除课程节点及其所有关系
    const result = await session.run(
      `
      MATCH (c:Course)
      WHERE c.course_id = $id OR c.id = $id
      DETACH DELETE c
      RETURN count(c) as deletedCount
      `,
      { id: parseInt(id) || id },
    );

    const deletedCount = result.records[0].get("deletedCount").toNumber();

    if (deletedCount > 0) {
      res.json({
        success: true,
        message: "课程删除成功",
        deletedCount: deletedCount,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "未找到该课程",
      });
    }
  } catch (e) {
    console.error("Error deleting course:", e);
    res.status(500).json({
      success: false,
      error: e.message,
    });
  } finally {
    await session.close();
  }
};

/**
 * 获取所有用户（学生）
 */
exports.getUsers = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (s:Student)
       OPTIONAL MATCH (s)-[:ENROLLED_IN]->(c:Course)
       WITH s, count(DISTINCT c) as coursesCount
       RETURN s, coursesCount
       ORDER BY s.name`,
    );

    const users = result.records.map((record) => {
      const student = record.get("s").properties;
      const coursesCount = record.get("coursesCount").toNumber();

      return {
        id: toNumber(student.student_id) || toNumber(student.id),
        username: student.name || student.username || "未命名",
        email: student.email || `${student.name}@example.com`,
        role: "student",
        status: "active",
        coursesCount: coursesCount,
        loginCount: toNumber(student.login_count) || 0,
        lastLogin: student.last_login || "未登录",
        createTime: student.created_at || "未知",
        phone: student.phone || "",
        department: student.department || "",
        major: student.major || "",
        grade: student.grade || "",
        studentId: student.student_id ? toNumber(student.student_id) : "",
      };
    });

    res.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error("获取用户失败:", error);
    res.status(500).json({
      success: false,
      message: "获取用户失败",
      error: error.message,
    });
  } finally {
    await session.close();
  }
};

/**
 * 删除用户（学生）
 */
exports.deleteUser = async (req, res) => {
  const session = driver.session();
  try {
    const { id } = req.params;

    const result = await session.run(
      `MATCH (s:Student)
       WHERE s.student_id = $id OR s.id = $id
       DETACH DELETE s
       RETURN count(s) as deletedCount`,
      { id: parseInt(id) },
    );

    const deletedCount = result.records[0].get("deletedCount").toNumber();

    if (deletedCount > 0) {
      res.json({
        success: true,
        message: "用户删除成功",
        deletedCount,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }
  } catch (error) {
    console.error("删除用户失败:", error);
    res.status(500).json({
      success: false,
      message: "删除用户失败",
      error: error.message,
    });
  } finally {
    await session.close();
  }
};

/**
 * 获取所有学科（Discipline）及其课程数量
 */
exports.getDisciplines = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `// 顶层学科
       MATCH (d:Discipline)
       // 学科直接包含的课程
       OPTIONAL MATCH (d)-[:CONTAINS]->(c1:Course)
       WITH d, count(DISTINCT c1) AS directCourseCount
       // 学科包含的子学科
       OPTIONAL MATCH (d)-[:CONTAINS]->(sd:SubDiscipline)
       // 子学科下的课程（通过 CONTAINS）
       OPTIONAL MATCH (sd)-[:CONTAINS]->(c2:Course)
       WITH d,
            directCourseCount,
            sd,
            count(DISTINCT c2) AS subCourseCount
       WITH d,
            directCourseCount,
            collect(DISTINCT { name: sd.name, courseCount: subCourseCount }) AS rawSubs,
            sum(subCourseCount) AS subTotal
       RETURN d.name AS name,
              directCourseCount + coalesce(subTotal, 0) AS courseCount,
              rawSubs AS subDisciplines
       ORDER BY name`,
    );

    const disciplines = result.records.map((record) => {
      const rawSubs = record.get("subDisciplines") || [];
      const subDisciplines = rawSubs.filter((s) => s.name);

      return {
        name: record.get("name"),
        courseCount: toNumber(record.get("courseCount")),
        subDisciplines: subDisciplines.map((s) => ({
          name: s.name,
          courseCount: toNumber(s.courseCount),
        })),
      };
    });

    res.json({
      success: true,
      data: disciplines,
      total: disciplines.length,
    });
  } catch (error) {
    console.error("获取学科失败:", error);
    res.status(500).json({
      success: false,
      message: "获取学科失败",
      error: error.message,
    });
  } finally {
    await session.close();
  }
};

/**
 * 更新学科名称
 */
exports.updateDisciplineName = async (req, res) => {
  const session = driver.session();
  try {
    const { oldName, newName } = req.body;

    if (!oldName || !newName) {
      return res.status(400).json({
        success: false,
        message: "缺少必要参数",
      });
    }

    const result = await session.run(
      `MATCH (d:Discipline { name: $oldName })
       SET d.name = $newName
       RETURN count(d) AS updatedCount`,
      { oldName, newName },
    );

    const updatedCount = result.records[0].get("updatedCount").toNumber();

    res.json({
      success: true,
      message: "学科名称更新成功",
      updatedCount,
    });
  } catch (error) {
    console.error("更新学科失败:", error);
    res.status(500).json({
      success: false,
      message: "更新学科失败",
      error: error.message,
    });
  } finally {
    await session.close();
  }
};
