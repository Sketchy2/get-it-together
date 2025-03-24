const { AppDataSource } = require("../database/ormconfig"); 
const { Task } = require("../entities/Task"); 

async function createTask() {
  const response = await fetch("/api/task", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Implement Task Feature",
      description: "Create and integrate task management system",
      status: "To-Do",
      priority: 1,
      due_date: "2025-03-22"
    })
  });

  if (!response.ok) {
    console.error("Error creating task:", await response.json());
    return;
  }

  const data = await response.json();
  console.log("Task Created:", data);
}

createTask();
