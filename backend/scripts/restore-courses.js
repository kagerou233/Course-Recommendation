const driver = require("../config/neo4j");

/**
 * 恢复课程数据（不删除现有数据）
 * 只添加不存在的课程
 */
async function restoreCourses() {
  const session = driver.session();

  try {
    console.log("开始检查并恢复课程数据...");

    // 首先检查当前有多少课程
    const countResult = await session.run(
      "MATCH (c:课程) RETURN count(c) as total",
    );
    const currentCount = countResult.records[0].get("total").toNumber();
    console.log(`当前数据库中有 ${currentCount} 个课程`);

    // 如果课程数量正常（接近600），询问是否继续
    if (currentCount > 500) {
      console.log("\n数据库中已有大量课程数据，看起来数据完整。");
      console.log("如果你确定要重新导入所有数据，请先手动清空数据库。");
      console.log("\n清空命令: MATCH (c:课程) DETACH DELETE c");
      return;
    }

    console.log("\n开始恢复课程数据...");

    // 这里可以添加恢复逻辑
    // 由于原始数据可能来自外部源，这里只是示例
    console.log("\n提示：");
    console.log("1. 如果你有课程数据备份文件，请提供文件路径");
    console.log("2. 如果需要从原始数据源重新导入，请运行相应的导入脚本");
    console.log("3. 当前数据库中的课程数据仍然保留");
  } catch (error) {
    console.error("恢复课程数据时出错:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

// 运行脚本
restoreCourses();
