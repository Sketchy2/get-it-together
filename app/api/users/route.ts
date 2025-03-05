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
        con = await oracledb.getConnection(dbConfig);
        const result = await con.execute(`SELECT user_id, full_name, email FROM APP_USER`);

        const users = result.rows.map((row: User) => ({
            user_id: row.USER_ID,
            full_name: row.FULL_NAME,
            email: row.EMAIL
        }));

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        if (con) await con.close();
    }
}

// POST create a new user
export async function POST(req: Request) {
    let con;
    try {
        const { full_name, email, password_hash } = await req.json();
        con = await oracledb.getConnection(dbConfig);
        
        await con.execute(
            `INSERT INTO APP_USER (user_id, full_name, email, password_hash, created_at) 
             VALUES (APP_USER_SEQ.NEXTVAL, :full_name, :email, :password_hash, CURRENT_TIMESTAMP)`,
            { full_name, email, password_hash }
        );

        await con.commit();
        return NextResponse.json({ message: "User Created!" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        if (con) await con.close();
    }
}
