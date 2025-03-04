const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');


const app = express(); // THIS IS CREATING A WEB SERVER
app.use(cors());
const PORT = 3000;

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Database Connection Pool Setup
async function createPool() {
    try {
        await oracledb.createPool({
            user: "ADMIN",
            password: "GetItTogether!Database1",
            connectString: "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-melbourne-1.oraclecloud.com))(connect_data=(service_name=g70cfee5a573e65_gitdb_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))",
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 2
        });
        console.log("✅ Connection Pool Created!");
    } catch (err) {
        console.error("❌ Error creating pool:", err);
    }
}

app.use(express.json()); // This allows the frontend to use JSON data

// Get All Users
app.get('/users', async (req, res) => {
    let con;
    try {
        con = await oracledb.getConnection();
        const result = await con.execute(`SELECT user_id, full_name, email FROM APP_USER`);

        // Convert OracleDB uppercase column names to lowercase
        const users = result.rows.map(row => ({
            user_id: row.USER_ID, 
            full_name: row.FULL_NAME, 
            email: row.EMAIL
        }));

        console.log("📢 Fixed Users:", users); // Debugging log

        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (con) await con.close();
    }
});


// Create a New User
app.post('/users', async (req, res) => {
    let con;
    try {
        const { full_name, email, password_hash } = req.body;
        con = await oracledb.getConnection();
        await con.execute(
            `INSERT INTO APP_USER (user_id, full_name, email, password_hash, created_at) 
             VALUES (APP_USER_SEQ.NEXTVAL, :full_name, :email, :password_hash, CURRENT_TIMESTAMP)`,
            { full_name, email, password_hash }
        );
        await con.commit();
        res.status(201).json({ message: "User Created!" });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (con) await con.close();
    }
});

// 3Get a Single User by ID
app.get('/users/:id', async (req, res) => {
    let con;
    try {
        const userId = req.params.id;
        con = await oracledb.getConnection();
        const result = await con.execute(`SELECT * FROM APP_USER WHERE user_id = :id`, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (con) await con.close();
    }
});

// Delete a User
app.delete('/users/:id', async (req, res) => {
    let con;
    try {
        const userId = req.params.id;
        con = await oracledb.getConnection();
        await con.execute(`DELETE FROM APP_USER WHERE user_id = :id`, [userId]);
        await con.commit();
        res.json({ message: "User deleted successfully!" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (con) await con.close();
    }
});

// Close Pool on Exit
process.on('SIGINT', async () => {
    console.log("Closing Connection Pool...");
    await oracledb.getPool().close(10);
    console.log("Connection Pool Closed!");
    process.exit(0);
});

// Start Server
async function startServer() {
    await createPool();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
