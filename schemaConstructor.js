import oracledb from 'oracledb'
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
    user: "ADMIN",
    password: "GetItTogether!Database1",
    connectString: "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-melbourne-1.oraclecloud.com))(connect_data=(service_name=g70cfee5a573e65_gitdb_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
};

async function dropAllTables() {
    let con;
    try {
        con = await oracledb.getConnection(dbConfig);
        console.log("✅ Connected to the database.");

        const result = await con.execute(`SELECT table_name FROM user_tables`);
        const tables = result.rows.map(row => row.TABLE_NAME);

        if (tables.length === 0) {
            console.log("✅ No tables found to drop.");
        } else {
            console.log("🗑️ Dropping tables:", tables);
            for (let table of tables.reverse()) {
                await con.execute(`DROP TABLE ${table} CASCADE CONSTRAINTS PURGE`);
                console.log(`✅ Dropped table: ${table}`);
            }
            await con.commit();
            console.log("✅ All tables dropped successfully!");
        }

        const seqResult = await con.execute(`SELECT sequence_name FROM user_sequences`);
        const sequences = seqResult.rows.map(row => row.SEQUENCE_NAME);

        if (sequences.length === 0) {
            console.log("✅ No sequences found to drop.");
        } else {
            console.log("🗑️ Dropping sequences:", sequences);
            for (let seq of sequences) {
                await con.execute(`DROP SEQUENCE ${seq}`);
                console.log(`✅ Dropped sequence: ${seq}`);
            }
            await con.commit();
            console.log("✅ All sequences dropped successfully!");
        }

    } catch (err) {
        console.error("❌ Error dropping tables or sequences:", err);
    } finally {
        if (con) {
            await con.close();
            console.log("✅ Connection closed.");
        }
    }
}

async function populateSchema() {
    let con;
    try {
        con = await oracledb.getConnection(dbConfig);
        console.log("✅ Connected to the database.");

        const queries = [
            `CREATE SEQUENCE APP_USER_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`,
            `CREATE SEQUENCE ACCOUNT_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`,
            `CREATE SEQUENCE SESSION_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`,
            `CREATE SEQUENCE VERIFICATIONTOKEN_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`,
            `CREATE SEQUENCE TASK_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`,
            `CREATE SEQUENCE TASKASSIGNEE_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`,
        
            `CREATE TABLE APP_USER (
                USER_ID NUMBER PRIMARY KEY,
                NAME VARCHAR2(100) NOT NULL,
                EMAIL VARCHAR2(255) UNIQUE NOT NULL,
                EMAIL_VERIFIED VARCHAR2(255),
                IMAGE VARCHAR2(500),
                CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
        
            `CREATE TRIGGER APP_USER_TRG 
            BEFORE INSERT ON APP_USER 
            FOR EACH ROW 
            BEGIN 
                IF :NEW.USER_ID IS NULL THEN 
                    SELECT APP_USER_SEQ.NEXTVAL INTO :NEW.USER_ID FROM DUAL; 
                END IF; 
            END;`,
        
            `CREATE TABLE ACCOUNT (
                ACCOUNT_ID NUMBER PRIMARY KEY,
                USER_ID NUMBER NOT NULL,
                TYPE VARCHAR2(50) NOT NULL,
                PROVIDER VARCHAR2(255) NOT NULL,
                PROVIDER_ACCOUNT_ID VARCHAR2(255) UNIQUE NOT NULL,
                REFRESH_TOKEN VARCHAR2(255),
                ACCESS_TOKEN VARCHAR2(255),
                EXPIRES_AT NUMBER,
                TOKEN_TYPE VARCHAR2(50),
                SCOPE VARCHAR2(255),
                ID_TOKEN VARCHAR2(500),
                SESSION_STATE VARCHAR2(255),
                CONSTRAINT FK_ACCOUNT_USER FOREIGN KEY (USER_ID) REFERENCES APP_USER(USER_ID) ON DELETE CASCADE
            )`,
        
            `CREATE TRIGGER ACCOUNT_TRG 
            BEFORE INSERT ON ACCOUNT 
            FOR EACH ROW 
            BEGIN 
                IF :NEW.ACCOUNT_ID IS NULL THEN 
                    SELECT ACCOUNT_SEQ.NEXTVAL INTO :NEW.ACCOUNT_ID FROM DUAL; 
                END IF; 
            END;`,
        
            `CREATE TABLE USER_SESSION (
                SESSION_ID NUMBER PRIMARY KEY,
                USER_ID NUMBER NOT NULL,
                SESSION_TOKEN VARCHAR2(255) UNIQUE NOT NULL,
                EXPIRES TIMESTAMP NOT NULL,
                CONSTRAINT FK_SESSION_USER FOREIGN KEY (USER_ID) REFERENCES APP_USER(USER_ID) ON DELETE CASCADE
            )`,
        
            `CREATE TRIGGER SESSION_TRG 
            BEFORE INSERT ON USER_SESSION 
            FOR EACH ROW 
            BEGIN 
                IF :NEW.SESSION_ID IS NULL THEN 
                    SELECT SESSION_SEQ.NEXTVAL INTO :NEW.SESSION_ID FROM DUAL; 
                END IF; 
            END;`,
        
            `CREATE TABLE TASK (
                TASK_ID NUMBER PRIMARY KEY,
                TITLE VARCHAR2(255) NOT NULL,
                DESCRIPTION CLOB,
                STATUS VARCHAR2(50) NOT NULL,
                PRIORITY NUMBER,
                DUE_DATE DATE,
                CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
        
            `CREATE TRIGGER TASK_TRG 
            BEFORE INSERT ON TASK 
            FOR EACH ROW 
            BEGIN 
                IF :NEW.TASK_ID IS NULL THEN 
                    SELECT TASK_SEQ.NEXTVAL INTO :NEW.TASK_ID FROM DUAL; 
                END IF; 
            END;`,
        
            `CREATE TABLE VERIFICATION_TOKEN (
                ID RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
                TOKEN VARCHAR2(255) NOT NULL,
                IDENTIFIER VARCHAR2(255) NOT NULL,
                EXPIRES TIMESTAMP NOT NULL
            )`,
        
            `CREATE TABLE TASKASSIGNEE (
                TASKASSIGNEE_ID NUMBER PRIMARY KEY,
                TASK_ID NUMBER NOT NULL,
                USER_ID NUMBER NOT NULL,
                CONSTRAINT FK_TASKASSIGNEE_TASK FOREIGN KEY (TASK_ID) REFERENCES TASK(TASK_ID) ON DELETE CASCADE,
                CONSTRAINT FK_TASKASSIGNEE_USER FOREIGN KEY (USER_ID) REFERENCES APP_USER(USER_ID) ON DELETE CASCADE
            )`,
        
            `CREATE TRIGGER TASKASSIGNEE_TRG 
            BEFORE INSERT ON TASKASSIGNEE 
            FOR EACH ROW 
            BEGIN 
                IF :NEW.TASKASSIGNEE_ID IS NULL THEN 
                    SELECT TASKASSIGNEE_SEQ.NEXTVAL INTO :NEW.TASKASSIGNEE_ID FROM DUAL; 
                END IF; 
            END;`,
        
            `CREATE INDEX IDX_ACCOUNT_USER ON ACCOUNT (USER_ID)`,
            `CREATE INDEX IDX_SESSION_USER ON USER_SESSION (USER_ID)`,
            `CREATE INDEX IDX_VERIFICATION_TOKEN_IDENTIFIER ON VERIFICATION_TOKEN (IDENTIFIER)`,
            `CREATE INDEX IDX_TASKASSIGNEE_TASK ON TASKASSIGNEE (TASK_ID)`,
            `CREATE INDEX IDX_TASKASSIGNEE_USER ON TASKASSIGNEE (USER_ID)`
        ];

        for (const query of queries) {
            await con.execute(query);
            console.log(`✅ Executed: ${query.split(" ")[1]}...`);
        }

        await con.commit();
        console.log("✅ Schema populated successfully!");

    } catch (err) {
        console.error("❌ Error creating tables:", err);
    } finally {
        if (con) {
            await con.close();
            console.log("✅ Connection closed.");
        }
    }
}

async function fetchTables() {
    let con;
    try {
        con = await oracledb.getConnection(dbConfig);
        console.log("✅ Connected to the database.");

        const result = await con.execute(`SELECT table_name FROM user_tables`);

        console.log("📋 Tables in the database:");
        result.rows.forEach(row => console.log(row.TABLE_NAME));

    } catch (err) {
        console.error("❌ Error fetching tables:", err);
    } finally {
        if (con) {
            await con.close();
            console.log("✅ Connection closed.");
        }
    }
}

async function main() {
    console.log("🚀 Executing Commands...");
    await dropAllTables();
    await populateSchema();
    await fetchTables();
}

main();
