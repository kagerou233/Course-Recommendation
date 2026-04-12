const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/neo4j.controller");

// User CRUD
router.post("/users", ctrl.createUser);
router.get("/users", ctrl.getUsers); // 获取所有学生和教师
router.get("/users/all", ctrl.getAllUsers); // 保留原有的方法
router.get("/users/:name", ctrl.getUserByName);
router.put("/users", ctrl.updateUser);
router.delete("/users/:id", ctrl.deleteUser); // 更新为按ID删除

// Relation
router.post("/relations/friend", ctrl.createFriendRelation);
router.get("/relations", ctrl.getAllRelations);

// Course
router.get("/course", ctrl.getAllCourses);
router.get("/course/category/:category", ctrl.getCoursesByCategory);
router.delete("/course/:id", ctrl.deleteCourse);

// Disciplines
router.get("/disciplines", ctrl.getDisciplines);
router.put("/disciplines", ctrl.updateDisciplineName);

module.exports = router;
