const http = require("http");

function testAPI(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log(`✓ ${description}`);
          console.log(`  状态码: ${res.statusCode}`);
          try {
            const json = JSON.parse(data);
            console.log(
              `  返回数据: ${Array.isArray(json) ? json.length + " 条记录" : "对象"}`,
            );
          } catch (e) {
            console.log(`  返回数据: ${data.substring(0, 100)}...`);
          }
        } else {
          console.log(`✗ ${description}`);
          console.log(`  状态码: ${res.statusCode}`);
          console.log(`  错误: ${data}`);
        }
        console.log("");
        resolve();
      });
    });

    req.on("error", (error) => {
      console.log(`✗ ${description}`);
      console.log(`  错误: ${error.message}`);
      console.log("  提示: 请确保服务器正在运行 (npm start)");
      console.log("");
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log("========================================");
  console.log("测试 Neo4j API 端点");
  console.log("========================================\n");

  await testAPI("/api/neo4j/users", "GET /api/neo4j/users - 获取所有用户");
  await testAPI(
    "/api/neo4j/relations",
    "GET /api/neo4j/relations - 获取所有关系",
  );
  await testAPI("/api/neo4j/course", "GET /api/neo4j/course - 获取所有课程");
  // 跳过中文URL测试，避免编码问题
  // await testAPI("/api/neo4j/course/category/前端开发", "...");

  console.log("========================================");
  console.log("测试完成！");
  console.log("========================================");
}

runTests();
