import oracledb from "oracledb";

export interface User {
    USER_ID: number;
    FULL_NAME: string;
    EMAIL: string;
}

// ✅ Define a TypeScript interface for TaskRow
export interface TaskRow {
    task_id: number;
    title: string;
    description: oracledb.Lob | string | null; // Can be LOB or converted string
    status: string;
    priority: number;
    due_date: string;
    created_at: string;
}