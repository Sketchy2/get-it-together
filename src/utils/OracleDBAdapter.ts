import type {
  Adapter,
  AdapterUser,
  VerificationToken,
  AdapterSession,
  AdapterAccount,
} from "@auth/core/adapters";

import OracleDB, { BindParameters } from "oracledb";

// Code is adapted from pg's implementation of adapter: https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-pg/src/index.ts
export default function OracleAdapter(
  clientPromise: Promise<OracleDB.Connection>
): Adapter {
  return {
    // user methods
    async createUser(user: AdapterUser): Promise<AdapterUser> {
      const client = await clientPromise;
      const { name, email, emailVerified, image } = user;
      const sql = `
        INSERT INTO APP_USER (name, email, "EMAIL_VERIFIED", image)
        VALUES (:name, :email, :emailVerified, :image)
        RETURNING USER_ID, name, email, "EMAIL_VERIFIED", image`;
    
      const bindVars = {
        name,
        email,
        emailVerified, // Now correctly matches the SQL placeholder
        image,
      };
    
      try {
        const result = await client.execute(sql, bindVars, {
          autoCommit: true,
        });
    
        if (result && result.rows) {
          return result.rows[0] as AdapterUser;
        } else {
          throw new RangeError("Index Out of Bounds");
        }
      } catch (err) {
        console.error("Unable to create new user", err);
        throw new Error("Unable to create new user");
      }
    },
        async getUser(id: string): Promise<null | AdapterUser> {
      const client = await clientPromise;
      const sql = `SELECT * FROM APP_USER WHERE USER_ID = :id`;
      const result = await client.execute(sql, { id });
      return result.rows && result.rows.length > 0
        ? (result.rows[0] as AdapterUser)
        : null;
    },
    async updateUser(user: Partial<AdapterUser>): Promise<AdapterUser> {
      console.log("updateUser");

      const client = await clientPromise;
    
      try {
        // Fetch the existing user
        const fetchSql = `SELECT * FROM APP_USER WHERE USER_ID = :userId`;
        let query1;
        try {
          query1 = await client.execute(fetchSql, { userId: user.id });
        } catch (err) {
          console.error("Error fetching user:", err);
          throw new Error("Database error while fetching user");
        }
    
        if (!query1.rows || query1.rows.length === 0) {
          throw new Error("User not found");
        }
    
        const oldUser = query1.rows[0] as AdapterUser;
    
        // Merge existing and new user data
        const newUser = { ...oldUser, ...user };
    
        // Destructure safely with a different name for `id`
        const { id: userId, name, email, emailVerified, image } = newUser;
    
        // Update the user in the database
        const updateSql = `
          UPDATE APP_USER
          SET name = :name, email = :email, "EMAIL_VERIFIED" = :emailVerified, image = :image
          WHERE USER_ID = :userId
        `;
    
        let result;
        try {
          result = await client.execute(
            updateSql,
            { userId, name, email, emailVerified, image },
            { autoCommit: true }
          );
        } catch (err) {
          console.error("Error updating user:", err);
          throw new Error("Database error while updating user");
        }
    
        // Check if any rows were updated
        if (!result || result.rowsAffected === 0) {
          throw new Error("User update failed");
        }
    
        // Fetch the updated user
        const updatedUserSql = `SELECT * FROM APP_USER WHERE USER_ID = :userId`;
        let query2;
        try {
          query2 = await client.execute(updatedUserSql, { userId });
        } catch (err) {
          console.error("Error fetching updated user:", err);
          throw new Error("Database error while retrieving updated user");
        }
    
        if (!query2.rows || query2.rows.length === 0) {
          throw new Error("User retrieval failed after update");
        }
    
        return query2.rows[0] as AdapterUser;
      } catch (error) {
        console.error("updateUser error:", error);
        throw error; // Rethrow error for higher-level handling
      }
    },
    
    
    async getUserByAccount({
      providerAccountId,
      provider,
    }): Promise<AdapterUser | null> {
      console.log("getUserByAccount");
      const client = await clientPromise;
      const sql = `
          SELECT u.* FROM APP_USER u
          JOIN ACCOUNT a ON u.USER_ID = a."USER_ID"
          WHERE a.provider = :provider AND a."PROVIDER_ACCOUNT_ID" = :providerAccountId`;
      const result = await client.execute(sql, {
        provider,
        providerAccountId,
      });
      return result.rows && result.rows.length > 0
        ? (result.rows[0] as AdapterUser)
        : null;
    },
    async linkAccount(account: AdapterAccount) {
      const client = await clientPromise;
      // Destructuring the account object to extract properties
      const {
        userId,
        provider,
        type,
        providerAccountId,
        access_token,
        expires_at,
        refresh_token,
        id_token,
        scope,
        session_state,
        token_type,
      } = account;

      // SQL query with named bind parameters (e.g., :userId)
      const sql = `
          INSERT INTO ACCOUNT ("USER_ID", provider, type, "PROVIDER_ACCOUNT_ID", access_token, expires_at, refresh_token, id_token, scope, session_state, token_type)
          VALUES (:userId, :provider, :type, :providerAccountId, :access_token, :expires_at, :refresh_token, :id_token, :scope, :session_state, :token_type)
          RETURNING USER_ID, "USER_ID", provider, type, "PROVIDER_ACCOUNT_ID", access_token, expires_at, refresh_token, id_token, scope, session_state, token_type
      `;

      // Parameters for the query, matching the named bind parameters in the SQL query
      const params = {
        userId,
        provider,
        type,
        providerAccountId,
        access_token,
        expires_at,
        refresh_token,
        id_token,
        scope,
        session_state,
        token_type,
      } as BindParameters;

      try {
        await client.execute(sql, params, { autoCommit: true });

        // if (result && result.rows) return result.rows[0];
      } catch (error) {
        console.error("Error executing query:", error);
      }
    }, // DB Session management
    async createSession({
      sessionToken,
      userId,
      expires,
    }): Promise<AdapterSession> {
      const client = await clientPromise;
      if (userId === undefined) {
        throw Error("userId is undefined in createSession");
      }
      const sql = `
          INSERT INTO USER_SESSION ("USER_ID", expires, "SESSION_TOKEN")
          VALUES (:userId, :expires, :sessionToken)
          RETURNING USER_ID, "SESSION_TOKEN", "USER_ID", expires`;
      const result = await client.execute(sql, {
        userId,
        expires,
        sessionToken,
      });
      if (result && result.rows) {
        return result.rows[0] as AdapterSession;
      } else {
        throw Error("There was an error creating this session");
      }
    },

    async getSessionAndUser(sessionToken: string | undefined): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> {
      const client = await clientPromise;
      if (sessionToken === undefined) {
        return null;
      }

      const result1 = await client.execute(
        `SELECT * FROM USER_SESSION WHERE "SESSION_TOKEN" = :sessionToken`,
        { sessionToken }
      );
      if (!result1.rows || result1.rows.length === 0) {
        return null;
      } else {
        const session = result1.rows[0] as AdapterSession;

        const result2 = await client.execute(
          `SELECT * FROM APP_USER WHERE USER_ID = :userId`,
          { userId: session.userId }
        );
        if (!result2.rows || result2.rows.length === 0) {
          return null;
        } else {
          const user = result2.rows[0] as AdapterUser;
          return { session, user };
        }
      }
    },

    async updateSession(
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ): Promise<AdapterSession | null | undefined> {
      const client = await clientPromise;
      const { sessionToken } = session;
      const result1 = await client.execute(
        `SELECT * FROM USER_SESSION WHERE "SESSION_TOKEN" = :sessionToken`,
        { sessionToken }
      );
      if (!result1.rows || result1.rows.length === 0) {
        return null;
      }
      const originalSession = result1.rows[0] as AdapterSession;

      const newSession: AdapterSession = {
        ...originalSession,
        ...session,
      };
      const sql = `
          UPDATE USER_SESSION SET expires = :expires WHERE "SESSION_TOKEN" = :sessionToken
        `;
      const result = await client.execute(sql, {
        sessionToken: newSession.sessionToken,
        expires: newSession.expires,
      });
      if (result && result.rows) {
        return newSession as AdapterSession;
      } // SHOULD SELECT AFTER BUT EH
    },

    async deleteSession(sessionToken: string) {
      const client = await clientPromise;
      const sql = `DELETE FROM USER_SESSION WHERE "SESSION_TOKEN" = :sessionToken`;
      await client.execute(sql, { sessionToken });
    },

    // Verification token methods
    async createVerificationToken(
      verificationToken: VerificationToken
    ): Promise<VerificationToken> {
      const client = await clientPromise;
      const { identifier, expires, token } = verificationToken;

      const sql = `
                      INSERT INTO VERIFICATIONTOKEN (IDENTIFIER, TOKEN, EXPIRES) 
                      VALUES (:identifier, :token, TO_TIMESTAMP(:expires, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
              `;
      await client.execute(sql, {
        identifier: identifier,
        token: token,
        expires: expires, // Make sure expires is in 'YYYY-MM-DD"T"HH24:MI:SS"Z"' format
      });

      return verificationToken; // optimally want to get the return value from the above, but ceebs
    },

    async useVerificationToken({
      identifier,
      token,
    }: {
      identifier: string;
      token: string;
    }): Promise<VerificationToken | null> {
      const client = await clientPromise;
      const sql = `DELETE FROM VERIFICATIONTOKEN
                  WHERE identifier = :identifier AND token = :token
                  RETURNING identifier, expires, token`;
      const result = await client.execute(sql, {
        identifier,
        token,
      });
      return result.rows && result.rows.length > 0
        ? (result.rows[0] as VerificationToken)
        : null;
    },
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const client = await clientPromise;
      const sql = `SELECT * FROM APP_USER WHERE email = :email`;
      const result = await client.execute(sql, { email });
      return result.rows && result.rows.length > 0
        ? (result.rows[0] as AdapterUser)
        : null;
    },

    async unlinkAccount(partialAccount: AdapterAccount) {
      const client = await clientPromise;
      const { provider, providerAccountId } = partialAccount;
      const sql = `DELETE FROM ACCOUNT WHERE "PROVIDER_ACCOUNT_ID" = :providerAccountId AND provider = :provider`;
      await client.execute(sql, { providerAccountId, provider });
    },

    async deleteUser(userId: string) {
      const client = await clientPromise;
      await client.execute(`DELETE FROM APP_USER WHERE USER_ID = :userId`, {
        userId,
      });
      await client.execute(
        `DELETE FROM USER_SESSION WHERE "USER_ID" = :userId`,
        {
          userId,
        }
      );
      await client.execute(`DELETE FROM ACCOUNT WHERE "USER_ID" = :userId`, {
        userId,
      });
    },
  };
}
