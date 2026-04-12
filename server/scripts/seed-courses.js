const driver = require("../config/neo4j");

/**
 * 向Neo4j数据库中添加示例课程数据
 */
async function seedCourses() {
  const session = driver.session();

  try {
    console.log("开始创建课程数据...");

    // 清除现有课程数据（可选）
    await session.run("MATCH (c:Course) DETACH DELETE c");
    console.log("已清除现有课程数据");

    // 创建示例课程
    const courses = [
      {
        id: 1,
        title: "Vue.js 完整开发指南",
        description:
          "从零开始学习Vue.js，包含组件开发、路由管理、状态管理等核心概念",
        category: "前端开发",
        type: "视频课程",
        level: "中级",
        duration: "12小时",
        status: "已发布",
        views: 1234,
        rating: 4.8,
        createTime: "2023-12-01 10:30",
        image: "https://via.placeholder.com/300x200/42b883/ffffff?text=Vue.js",
      },
      {
        id: 2,
        title: "Python数据分析实战",
        description:
          "使用Python进行数据清洗、分析和可视化，掌握pandas、numpy等工具",
        category: "数据科学",
        type: "实战项目",
        level: "高级",
        duration: "8小时",
        status: "已发布",
        views: 2156,
        rating: 4.9,
        createTime: "2023-11-28 14:20",
        image: "https://via.placeholder.com/300x200/3776ab/ffffff?text=Python",
      },
      {
        id: 3,
        title: "机器学习算法详解",
        description: "深入理解机器学习核心算法，包含理论讲解和代码实现",
        category: "人工智能",
        type: "文章教程",
        level: "高级",
        duration: "15小时",
        status: "草稿",
        views: 0,
        rating: 0,
        createTime: "2023-12-05 09:15",
        image: "https://via.placeholder.com/300x200/ff6b6b/ffffff?text=ML",
      },
      {
        id: 4,
        title: "React Native移动开发",
        description: "使用React Native开发跨平台移动应用，一套代码多端运行",
        category: "移动开发",
        type: "视频课程",
        level: "中级",
        duration: "10小时",
        status: "已发布",
        views: 876,
        rating: 4.6,
        createTime: "2023-11-25 16:45",
        image: "https://via.placeholder.com/300x200/61dafb/ffffff?text=React",
      },
      {
        id: 5,
        title: "Node.js后端开发",
        description: "构建高性能的Node.js后端服务，包含Express、数据库操作等",
        category: "后端开发",
        type: "实战项目",
        level: "中级",
        duration: "14小时",
        status: "已下线",
        views: 543,
        rating: 4.5,
        createTime: "2023-11-20 11:30",
        image: "https://via.placeholder.com/300x200/68a063/ffffff?text=Node.js",
      },
      {
        id: 6,
        title: "Docker容器化部署",
        description: "学习Docker容器技术，实现应用的快速部署和扩展",
        category: "云计算",
        type: "视频课程",
        level: "中级",
        duration: "6小时",
        status: "已发布",
        views: 432,
        rating: 4.4,
        createTime: "2023-11-18 13:00",
        image: "https://via.placeholder.com/300x200/2496ed/ffffff?text=Docker",
      },
      {
        id: 7,
        title: "深度学习与神经网络",
        description: "掌握深度学习基础，了解CNN、RNN等神经网络架构",
        category: "人工智能",
        type: "视频课程",
        level: "高级",
        duration: "20小时",
        status: "已发布",
        views: 1567,
        rating: 4.9,
        createTime: "2023-12-03 15:30",
        image: "https://via.placeholder.com/300x200/8b5cf6/ffffff?text=DL",
      },
      {
        id: 8,
        title: "TypeScript高级编程",
        description: "深入学习TypeScript类型系统，提升代码质量和开发效率",
        category: "编程开发",
        type: "文章教程",
        level: "高级",
        duration: "9小时",
        status: "已发布",
        views: 987,
        rating: 4.7,
        createTime: "2023-11-30 11:00",
        image: "https://via.placeholder.com/300x200/3178c6/ffffff?text=TS",
      },
    ];

    // 批量创建课程节点
    for (const course of courses) {
      await session.run(
        `
        CREATE (c:Course {
          id: $id,
          title: $title,
          description: $description,
          category: $category,
          type: $type,
          level: $level,
          duration: $duration,
          status: $status,
          views: $views,
          rating: $rating,
          createTime: $createTime,
          image: $image
        })
        `,
        course,
      );
      console.log(`✓ 创建课程: ${course.title}`);
    }

    console.log(`\n成功创建 ${courses.length} 个课程！`);
    console.log("\n你可以通过以下API访问课程数据:");
    console.log("- GET http://localhost:3000/api/neo4j/course");
    console.log(
      "- GET http://localhost:3000/api/neo4j/course/category/前端开发",
    );
  } catch (error) {
    console.error("创建课程数据时出错:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

// 运行脚本
seedCourses();
