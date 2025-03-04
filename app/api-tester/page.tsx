"use client";
import { useState, useEffect } from "react";

export default function APITester() {
    const [users, setUsers] = useState<any[]>([]);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Fetch Users
    async function fetchUsers() {
        try {
            const response = await fetch("http://localhost:3000/users");
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    // Create User
    async function createUser(e: React.FormEvent) {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: fullName,
                    email,
                    password_hash: password,
                }),
            });
            if (response.ok) {
                alert("User Created!");
                fetchUsers(); // Refresh users list
            } else {
                alert("Error creating user.");
            }
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }

    // Fetch users on page load
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div style={{ maxWidth: "600px", margin: "auto"}}>
            <h1> API Tester</h1>

            <button onClick={fetchUsers} style={{ marginBottom: "10px" }}> Refresh Users</button>

            <h2>Users</h2>
            {users.length > 0 ? (
                <ul>
                    {users.map((user) => (
                        <li key={user.user_id}>
                            {user.full_name} - {user.email}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No users found.</p>
            )}

            <h2>Create New User</h2>
            <form onSubmit={createUser} style={{ display: "flex", flexDirection: "column" }}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{ marginBottom: "8px", padding: "8px" }}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ marginBottom: "8px", padding: "8px" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ marginBottom: "8px", padding: "8px" }}
                />
                <button type="submit">Create User</button>
            </form>
        </div>
    );
}
