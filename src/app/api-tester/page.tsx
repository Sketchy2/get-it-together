"use client";
import React, { useState, useEffect } from "react";

export default function APITester() {
  // ------------------ USERS STATE & FUNCTIONS ------------------
  const [users, setUsers] = useState<any[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password_hash: password,
        }),
      });
      if (res.ok) {
        alert("User Created!");
        setFullName("");
        setEmail("");
        setPassword("");
        fetchUsers();
      } else {
        alert("Error creating user.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }

  // ------------------ TASKS STATE & FUNCTIONS ------------------
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStatus, setTaskStatus] = useState("To-Do");
  const [taskPriority, setTaskPriority] = useState(1);
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskUser, setTaskUser] = useState("");

  // For updating a task
  const [updateTaskId, setUpdateTaskId] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [updatePriority, setUpdatePriority] = useState<number | null>(null);
  const [updateDueDate, setUpdateDueDate] = useState("");

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskUser) {
      alert("Please select a user to assign this task.");
      return;
    }
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          status: taskStatus,
          priority: taskPriority,
          due_date: taskDueDate,
          user_id: taskUser,
        }),
      });
      if (res.ok) {
        alert("Task Created & Assigned!");
        // Clear task form
        setTaskTitle("");
        setTaskDescription("");
        setTaskStatus("To-Do");
        setTaskPriority(1);
        setTaskDueDate("");
        setTaskUser("");
        fetchTasks();
      } else {
        alert("Error creating task.");
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  async function updateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!updateTaskId) {
      alert("Please provide a Task ID to update.");
      return;
    }
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: updateTaskId,
          title: updateTitle,
          description: updateDescription,
          status: updateStatus,
          priority: updatePriority,
          due_date: updateDueDate,
        }),
      });
      if (res.ok) {
        alert("Task Updated!");
        // Clear update form
        setUpdateTaskId("");
        setUpdateTitle("");
        setUpdateDescription("");
        setUpdateStatus("");
        setUpdatePriority(null);
        setUpdateDueDate("");
        fetchTasks();
      } else {
        alert("Error updating task.");
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  // ------------------ Fetch Data on Load ------------------
  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  // ------------------ Styling ------------------
  const containerStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "2rem auto",
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f2f2f2",
    borderRadius: "8px",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "2rem",
    padding: "1.5rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    marginTop: "1rem",
  };

  const inputStyle: React.CSSProperties = {
    marginBottom: "8px",
    padding: "8px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    marginTop: "0.5rem",
    width: "fit-content",
  };

  const listStyle: React.CSSProperties = {
    listStyleType: "none",
    paddingLeft: 0,
    marginTop: "1rem",
  };

  const listItemStyle: React.CSSProperties = {
    backgroundColor: "#fafafa",
    marginBottom: "8px",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  };

  const headingStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "2rem",
    marginBottom: "2rem",
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>🛠 API Tester</h1>

      {/* ------------------ USERS SECTION ------------------ */}
      <div style={sectionStyle}>
        <h2>👥 User Management</h2>
        <button onClick={fetchUsers} style={buttonStyle}>
          🔄 Refresh Users
        </button>
        {users.length > 0 ? (
          <ul style={listStyle}>
            {users.map((user) => (
              <li key={user.user_id} style={listItemStyle}>
                <strong>{user.full_name}</strong> - {user.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found.</p>
        )}
        <h3>Create New User</h3>
        <form onSubmit={createUser} style={formStyle}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle}>
            ✅ Create User
          </button>
        </form>
      </div>

      {/* ------------------ TASKS SECTION ------------------ */}
      <div style={sectionStyle}>
        <h2>✅ Task Management</h2>
        <button onClick={fetchTasks} style={buttonStyle}>
          🔄 Refresh Tasks
        </button>

        {tasks.length > 0 ? (
        <ul style={listStyle}>
            {tasks.map((task) => (
            <li key={task.task_id} style={listItemStyle}>
                <strong>ID: {task.task_id} - {task.title}</strong> - {task.status} (Priority: {task.priority})
            </li>
            ))}
        </ul>
        ) : (
        <p>No tasks found.</p>
        )}

        <h3>Create New Task</h3>
        <form onSubmit={createTask} style={formStyle}>
          <input
            type="text"
            placeholder="Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            style={inputStyle}
            required
          />
          <textarea
            placeholder="Description"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            style={inputStyle}
          />
          <select
            value={taskStatus}
            onChange={(e) => setTaskStatus(e.target.value)}
            style={inputStyle}
            required
          >
            <option value="To-Do">To-Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <input
            type="number"
            placeholder="Priority (1-5)"
            value={taskPriority}
            onChange={(e) => setTaskPriority(Number(e.target.value))}
            min="1"
            max="5"
            style={inputStyle}
            required
          />
          <input
            type="date"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
            style={inputStyle}
            required
          />
          <select
            value={taskUser}
            onChange={(e) => setTaskUser(e.target.value)}
            style={inputStyle}
            required
          >
            <option value="">Select a User for Assignment</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.full_name}
              </option>
            ))}
          </select>
          <button type="submit" style={buttonStyle}>
            ✅ Create Task
          </button>
        </form>
      </div>
    </div>
  );
}
