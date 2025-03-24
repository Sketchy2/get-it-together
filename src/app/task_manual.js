const { AppDataSource } = require("../database/ormconfig"); // Adjust path
const { Task } = require("../entities/Task"); // Adjust path

async function createTask() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connected successfully!");
    }

    const taskRepo = AppDataSource.getRepository(Task);
    const newTask = taskRepo.create({
      title: "Test Task",
      description: "This is a test task created manually",
      status: "To-Do",
      priority: 1,
      due_date: new Date("2025-03-20"),
    });

    const savedTask = await taskRepo.save(newTask);
    console.log("✅ Task created successfully:", savedTask);
  } catch (error) {
    console.error("❌ Error creating task:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

createTask();
