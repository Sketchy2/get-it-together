// eslint-disable-next-line @typescript-eslint/no-require-imports
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Connection credentials
const dbConfig = {
    user: "ADMIN",
    password: "GetItTogether!Database1",
    connectString: "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-melbourne-1.oraclecloud.com))(connect_data=(service_name=g70cfee5a573e65_gitdb_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
};

async function dropAllTables() {
    let con;
    try {
        con = await oracledb.getConnection(dbConfig);
        console.log("Connected to the database.");

        // Drop all tables
        const result = await con.execute(`SELECT table_name FROM user_tables`);
        const tables = result.rows.map(row => row.TABLE_NAME);

        if (tables.length === 0) {
            console.log("No tables found to drop.");
        } else {
            console.log("Dropping tables:", tables);
            for (let table of tables.reverse()) {
                await con.execute(`DROP TABLE ${table} CASCADE CONSTRAINTS PURGE`);
                console.log(`Dropped table: ${table}`);
            }
            await con.commit();
            console.log("All tables dropped successfully!");
        }

        // Drop sequences
        const seqResult = await con.execute(`SELECT sequence_name FROM user_sequences`);
        const sequences = seqResult.rows.map(row => row.SEQUENCE_NAME);

        if (sequences.length === 0) {
            console.log("No sequences found to drop.");
        } else {
            console.log("Dropping sequences:", sequences);
            for (let seq of sequences) {
                await con.execute(`DROP SEQUENCE ${seq}`);
                console.log(`Dropped sequence: ${seq}`);
            }
            await con.commit();
            console.log("All sequences dropped successfully!");
        }

    } catch (err) {
        console.error("Error dropping tables or sequences:", err);
    } finally {
        if (con) {
            await con.close();
            console.log("Connection closed.");
        }
    }
}


async function populateSchema() {
    let con;
    try {
        con = await oracledb.getConnection(dbConfig);
        console.log("Connected to the database.");

        const queries = [
            // Create Sequence for user_id
            `CREATE SEQUENCE APP_USER_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`,
            `CREATE SEQUENCE TASK_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`,
            `CREATE SEQUENCE TASKASSIGNEE_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`,


            // Create APP_USER table
            `CREATE TABLE APP_USER (
                user_id NUMBER PRIMARY KEY,
                full_name VARCHAR2(100) NOT NULL,
                email VARCHAR2(255) UNIQUE NOT NULL,
                password_hash VARCHAR2(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )`,

            // Create TASK table
            `CREATE TABLE TASK (
                task_id NUMBER PRIMARY KEY,
                title VARCHAR2(255) NOT NULL,
                description VARCHAR2(500),
                status VARCHAR2(50) CHECK (status IN ('To-Do', 'In Progress', 'Completed')),
                priority NUMBER CHECK (priority BETWEEN 1 AND 5),
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // Create TASKASSIGNEE table
            `CREATE TABLE TASKASSIGNEE (
                taskassignee_id NUMBER PRIMARY KEY,
                task_id NUMBER REFERENCES TASK(task_id) ON DELETE CASCADE,
                user_id NUMBER REFERENCES APP_USER(user_id) ON DELETE CASCADE
            )`
        ];

        for (let query of queries) {
            await con.execute(query);
            console.log(`Executed: ${query.split("(")[0]}`); // Logs each command
        }

        await con.commit();
        console.log("Schema populated successfully!");

    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        if (con) {
            await con.close();
            console.log("Connection closed.");
        }
    }
}


// Fetch Tables
async function fetchTables() {
    let con;
    try {
        con = await oracledb.getConnection(dbConfig);
        console.log("Connected to the database.");

        const result = await con.execute(`SELECT table_name FROM user_tables`);

        console.log("Tables in the database:");
        result.rows.forEach(row => console.log(row.TABLE_NAME));

    } catch (err) {
        console.error("Error fetching tables:", err);
    } finally {
        if (con) {
            await con.close();
            console.log("Connection closed.");
        }
    }
}

// Run the Workflow in Order
async function main() {
    console.log("Executing Commands.")
    await dropAllTables();
    await populateSchema();
    await fetchTables();
}

main();