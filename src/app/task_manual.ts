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


async function getTasks() {
  const response = await fetch("/api/task");

  if (!response.ok) {
    console.error("Error fetching tasks:", await response.json());
    return;
  }

  const tasks = await response.json();
  console.log("Tasks:", tasks);
}

getTasks();

async function updateTask(taskId: number) {
  const response = await fetch(`/api/task?id=${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Updated Task Title",
      status: "In Progress"
    })
  });

  if (!response.ok) {
    console.error("Error updating task:", await response.json());
    return;
  }

  const data = await response.json();
  console.log("Task Updated:", data);
}

updateTask(2);
