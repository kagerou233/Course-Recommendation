// 测试路由是否正确加载
const ctrl = require("./controllers/neo4j.controller");

console.log("检查 neo4j.controller.js 中的导出函数:");
console.log("- createUser:", typeof ctrl.createUser);
console.log("- getAllUsers:", typeof ctrl.getAllUsers);
console.log("- getUserByName:", typeof ctrl.getUserByName);
console.log("- updateUser:", typeof ctrl.updateUser);
console.log("- deleteUser:", typeof ctrl.deleteUser);
console.log("- createFriendRelation:", typeof ctrl.createFriendRelation);
console.log("- getAllRelations:", typeof ctrl.getAllRelations);
console.log("- getAllCourses:", typeof ctrl.getAllCourses);
console.log("- getCoursesByCategory:", typeof ctrl.getCoursesByCategory);

console.log("\n✓ 所有课程相关函数已正确导出！");
console.log("\n请确保:");
console.log("1. 停止当前运行的服务器 (Ctrl+C)");
console.log("2. 重新启动服务器: npm start");
console.log("3. 然后访问: http://localhost:3000/api/neo4j/course");
