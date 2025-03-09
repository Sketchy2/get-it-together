import { NextResponse } from "next/server";
import { User } from "@/types/database";


const oracledb = require("oracledb");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const dbConfig = {
    user: "ADMIN",
    password: "GetItTogether!Database1",
    connectString: "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-melbourne-1.oraclecloud.com))(connect_data=(service_name=g70cfee5a573e65_gitdb_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
};

// GET all users
export async function GET() {
    let con;
    try {
        console.log("🔍 Fetching users from DB...");
        con = await oracledb.getConnection(dbConfig);
        console.log("✅ Connected to DB");

        const result = await con.execute(`SELECT user_id, name AS full_name, email FROM APP_USER`);
        console.log("✅ Query executed successfully:", result.rows);

        const users = result.rows.map((row: User) => ({
            user_id: row.USER_ID,
            full_name: row.FULL_NAME,
            email: row.EMAIL
        }));

        console.log("✅ Users fetched:", users);
        return NextResponse.json(users);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("❌ API Error:", error.message);
            return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
        } else {
            console.error("❌ API Error: Unknown error", error);
            return NextResponse.json({ error: "Internal Server Error", details: "An unknown error occurred" }, { status: 500 });
        }
    } finally {
        if (con) {
            console.log("🔌 Closing database connection...");
            await con.close();
        }
    }
}