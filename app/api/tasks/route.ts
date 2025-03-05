import { NextResponse } from "next/server";
import { TaskRow } from "@/types/database";

const oracledb = require("oracledb");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const dbConfig = {
    user: "ADMIN",
    password: "GetItTogether!Database1",
    connectString: "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-melbourne-1.oraclecloud.com))(connect_data=(service_name=g70cfee5a573e65_gitdb_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
};

// GET All Tasks (Handles CLOBs)
export async function GET() {
    let con;
    try {
        console.log("🔍 Attempting to connect to the database...");
        con = await oracledb.getConnection(dbConfig);
        console.log("✅ Connected! Running SELECT query...");

        const result = await con.execute(`
            SELECT task_id as "task_id", title as "title", description as "description",
                   status as "status", priority as "priority", due_date as "due_date",
                   created_at as "created_at"
            FROM TASK
        `);

        // Convert CLOB fields (description) to string
        const tasks = await Promise.all(result.rows.map(async (row: TaskRow) => {
            if (row.description && row.description instanceof oracledb.Lob) {
                row.description = await lobToString(row.description); // Convert LOB to string
            }
            return row;
        }));

        console.log("📋 Processed Tasks:", tasks);

        return NextResponse.json(tasks);

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("❌ API Error:", error.message);
            return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
        } else {
            console.error("❌ API Error: Unknown error", error);
            return NextResponse.json({ error: "Internal Server Error", details: "Unknown error occurred" }, { status: 500 });
        }
    } finally {
        if (con) {
            console.log("🔌 Closing database connection...");
            await con.close();
        }
    }
}

// POST Create a New Task
export async function POST(req: Request) {
    let con;
    try {
        const { title, description, status, priority, due_date, user_id } = await req.json();

        // Validate required fields
        if (!title || !status || !priority || !user_id) {
            return NextResponse.json({ error: "Title, status, priority, and user_id are required" }, { status: 400 });
        }

        console.log("📥 Received new task data:", { title, description, status, priority, due_date, user_id });

        con = await oracledb.getConnection(dbConfig);

        // Insert task and get generated ID
        const taskResult = await con.execute(
            `INSERT INTO TASK (task_id, title, description, status, priority, due_date, created_at) 
             VALUES (TASK_SEQ.NEXTVAL, :title, :description, :status, :priority, TO_DATE(:due_date, 'YYYY-MM-DD'), CURRENT_TIMESTAMP) 
             RETURNING task_id INTO :task_id`,
            { title, description, status, priority, due_date, task_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
        );

        const taskId = taskResult.outBinds.task_id[0]; // Get the generated task_id
        console.log("✅ Task Created with ID:", taskId);

        // Insert into TASKASSIGNEE
        await con.execute(
            `INSERT INTO TASKASSIGNEE (taskassignee_id, task_id, user_id) 
             VALUES (TASKASSIGNEE_SEQ.NEXTVAL, :task_id, :user_id)`,
            { task_id: taskId, user_id }
        );

        await con.commit();
        console.log("✅ Task Assigned to User:", user_id);

        return NextResponse.json({ message: "Task Created & Assigned!", task_id: taskId }, { status: 201 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("❌ API Error:", error.message);
            return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
        } else {
            console.error("❌ API Error: Unknown error", error);
            return NextResponse.json({ error: "Internal Server Error", details: "Unknown error occurred" }, { status: 500 });
        }
    } finally {
        if (con) {
            console.log("🔌 Closing database connection...");
            await con.close();
        }
    }
}

// Helper function to convert CLOBs to strings
async function lobToString(lob: any): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = "";
        lob.setEncoding("utf8"); // Set encoding for LOB stream
        lob.on("data", (chunk: string) => (data += chunk)); // Read chunks
        lob.on("end", () => resolve(data)); // Resolve when finished
        lob.on("error", (err: Error) => reject(err)); // Handle errors
    });
}
