import { NextResponse } from "next/server";
const oracledb = require("oracledb");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const dbConfig = {
    user: "ADMIN",
    password: "GetItTogether!Database1",
    connectString: "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-melbourne-1.oraclecloud.com))(connect_data=(service_name=g70cfee5a573e65_gitdb_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
};

// ADD GET METHOD TO FETCH TASKS
export async function GET() {
    let con;
    try {
        con = await oracledb.getConnection(dbConfig);

        // ✅ Use CAST() to explicitly return `description` as VARCHAR2(1000)
        const result = await con.execute(
            `SELECT 
                TASK_ID, 
                TITLE, 
                CAST(DESCRIPTION AS VARCHAR2(1000)) AS DESCRIPTION, 
                STATUS, 
                PRIORITY, 
                DUE_DATE, 
                CREATED_AT 
            FROM TASK 
            ORDER BY created_at DESC`
        );

        console.log("✅ Tasks fetched successfully:", result.rows);
        return NextResponse.json(result.rows, { status: 200 });

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



// KEEP EXISTING POST METHOD
export async function POST(req: Request) {
    let con;
    try {
        const { title, description, status, priority, due_date, user_id } = await req.json();

        if (!title || !status || !priority || !user_id) {
            return NextResponse.json({ error: "Title, status, priority, and user_id are required" }, { status: 400 });
        }

        console.log("📥 Received new task data:", { title, description, status, priority, due_date, user_id });

        con = await oracledb.getConnection(dbConfig);

        const taskResult = await con.execute(
            `INSERT INTO TASK (task_id, title, description, status, priority, due_date, created_at) 
             VALUES (TASK_SEQ.NEXTVAL, :title, :description, :status, :priority, TO_DATE(:due_date, 'YYYY-MM-DD'), CURRENT_TIMESTAMP) 
             RETURNING task_id INTO :task_id`,
            { title, description, status, priority, due_date, task_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
        );

        const taskId = taskResult.outBinds.task_id[0];
        console.log("✅ Task Created with ID:", taskId);

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
