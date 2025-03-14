import dotenv from "dotenv";
import oracledb from 'oracledb';  


oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
dotenv.config();

// Connection credentials
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    connectString: process.env.DB_CONNECT_STRING
};


// 3️⃣ Fetch Tables
async function fetchTables() {
    let con;
    try {
        con = await oracledb.getConnection(dbConfig);
        console.log("Connected to the database.");

        const result = await con.execute(`SELECT * FROM ACCOUNT`);

        console.log("Tables in the database:",result);
        // result.rows.forEach(row => console.log(row.TABLE_NAME));

    } catch (err) {
        console.error("Error fetching tables:", err);
    } finally {
        if (con) {
            await con.close();
            console.log("Connection closed.");
        }
    }
}

// 4️⃣ Run the Workflow in Order
async function main() {

    await fetchTables();
}

main();