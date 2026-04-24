const driver = require("./config/neo4j");

async function checkCourseProperties() {
  const session = driver.session();

  try {
    console.log("正在查询Neo4j中的'课程'节点属性...\n");

    // 获取一个"课程"节点示例
    const result = await session.run(
      `
      MATCH (c:课程)
      RETURN c
      LIMIT 1
      `,
    );

    if (result.records.length === 0) {
      console.log("❌ 没有找到'课程'节点");
      console.log("\n尝试查找所有节点标签...");

      const labelsResult = await session.run("CALL db.labels()");
      console.log("数据库中的所有标签:");
      labelsResult.records.forEach((record) => {
        console.log(`  - ${record.get(0)}`);
      });
      return;
    }

    const course = result.records[0].get("c");
    const properties = course.properties;

    console.log("✓ 找到'课程'节点");
    console.log("\n课程属性列表:");
    console.log("=====================================");

    Object.keys(properties).forEach((key) => {
      const value = properties[key];
      let type = typeof value;

      // 处理Neo4j特殊类型
      if (value && value.constructor && value.constructor.name) {
        if (value.constructor.name === "Integer") {
          type = "Integer (Neo4j)";
        }
      }

      console.log(`- ${key}: ${type}`);
      console.log(`  示例值: ${value}`);
    });

    console.log("\n=====================================");
    console.log("\n完整的课程数据示例:");
    console.log(JSON.stringify(properties, null, 2));

    // 统计所有"课程"节点
    const countResult = await session.run(
      "MATCH (c:课程) RETURN count(c) as total",
    );
    const total = countResult.records[0].get("total");
    console.log(`\n数据库中共有 ${total} 个'课程'节点`);
  } catch (error) {
    console.error("查询出错:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

checkCourseProperties();
