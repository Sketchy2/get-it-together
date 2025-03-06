import type {
  Adapter,
  AdapterUser,
  VerificationToken,
  AdapterSession,
  AdapterAccount,
} from "@auth/core/adapters";

import OracleDB from "oracledb";

export function mapExpiresAt(account: any): any {
  const expires_at: number = parseInt(account.expires_at);
  return {
    ...account,
    expires_at,
  };
}



// Code is adapted from pg's implementation of adapter: https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-pg/src/index.ts
export default function OracleAdapter(client: OracleDB.Connection): Adapter {
  return {
    // user methods
    async createUser(user: AdapterUser): Promise<AdapterUser> {
      const { name, email, emailVerified, image } = user;
      const sql = `
        INSERT INTO users (name, email, "emailVerified", image)
        VALUES (:name, :email, :emailVerified, :image)
        RETURNING id, name, email, "emailVerified", image`;

      const bindVars = {
        name,
        email,
        emailVerified,
        image,
      };

      try {
        const result = await client.execute(sql, bindVars, {
          autoCommit: true,
        });

        if (result && result.rows) {
          return result.rows[0] as AdapterUser; //NOTE NEED TO EXPLCITLY CHECK IF Is correct
        } else {
          throw new RangeError("Index Out of Bounds");
        }
      } catch (err) {
        console.error("Unable to create new user", err);
        throw new Error("Unable to create new user");
      }
    },
    async getUser(id: string): Promise<null | AdapterUser> {
      const sql = `SELECT * FROM users WHERE id = :id`;
      const result = await client.execute(sql, { id });
      return result.rows && result.rows.length > 0
        ? (result.rows[0] as AdapterUser)
        : null;
    },
    async getUserByAccount({
      providerAccountId,
      provider,
    }): Promise<AdapterUser | null> {
      const sql = `
          SELECT u.* FROM users u
          JOIN accounts a ON u.id = a."userId"
          WHERE a.provider = :provider AND a."providerAccountId" = :providerAccountId`;
      const result = await client.execute(sql, {
        provider,
        providerAccountId,
      });
      return result.rows && result.rows.length > 0
        ? (result.rows[0] as AdapterUser)
        : null;
    },
    async linkAccount(account: AdapterAccount) {
      const sql = `
          INSERT INTO accounts
          ("userId", provider, type, "providerAccountId", access_token, expires_at, refresh_token, id_token, scope, session_state, token_type)
          VALUES (:userId, :provider, :type, :providerAccountId, :access_token, :expires_at, :refresh_token, :id_token, :scope, :session_state, :token_type)
          RETURNING id, "userId", provider, type, "providerAccountId", access_token, expires_at, refresh_token, id_token, scope, session_state, token_type`;

      const params = {
        userId: account.userId,
        provider: account.provider,
        type: account.type,
        providerAccountId: account.providerAccountId,
        access_token: account.access_token,
        expires_at: account.expires_at,
        refresh_token: account.refresh_token,
        id_token: account.id_token,
        scope: account.scope,
        session_state: account.session_state,
        token_type: account.token_type,
      };

      const result = await client.execute(sql, params);
      if (result && result.rows) return mapExpiresAt(result.rows[0]);
    },
    // DB Session management
    async createSession({
      sessionToken,
      userId,
      expires,
    }): Promise<AdapterSession> {
      if (userId === undefined) {
        throw Error("userId is undefined in createSession");
      }
      const sql = `
          INSERT INTO sessions ("userId", expires, "sessionToken")
          VALUES (:userId, :expires, :sessionToken)
          RETURNING id, "sessionToken", "userId", expires`;
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
      if (sessionToken === undefined) {
        return null;
      }

      const result1 = await client.execute(
        `SELECT * FROM sessions WHERE "sessionToken" = :sessionToken`,
        { sessionToken }
      );
      if (!result1.rows || result1.rows.length === 0) {
        return null;
      } else {
        const session = result1.rows[0] as AdapterSession;

        const result2 = await client.execute(
          `SELECT * FROM users WHERE id = :userId`,
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
      const { sessionToken } = session;
      const result1 = await client.execute(
        `SELECT * FROM sessions WHERE "sessionToken" = :sessionToken`,
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
          UPDATE sessions SET expires = :expires WHERE "sessionToken" = :sessionToken
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
      const sql = `DELETE FROM sessions WHERE "sessionToken" = :sessionToken`;
      await client.execute(sql, { sessionToken });
    },

    // Verification token methods
    async createVerificationToken(
      verificationToken: VerificationToken
    ): Promise<VerificationToken> {
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
      const sql = `DELETE FROM verification_token
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
      const sql = `SELECT * FROM users WHERE email = :email`;
      const result = await client.execute(sql, { email });
      return result.rows && result.rows.length > 0
        ? (result.rows[0] as AdapterUser)
        : null;
    },

    async unlinkAccount(partialAccount: AdapterAccount) {
      const { provider, providerAccountId } = partialAccount;
      const sql = `DELETE FROM accounts WHERE "providerAccountId" = :providerAccountId AND provider = :provider`;
      await client.execute(sql, { providerAccountId, provider });
    },

    async deleteUser(userId: string) {
      await client.execute(`DELETE FROM users WHERE id = :userId`, { userId });
      await client.execute(`DELETE FROM sessions WHERE "userId" = :userId`, {
        userId,
      });
      await client.execute(`DELETE FROM accounts WHERE "userId" = :userId`, {
        userId,
      });
    },
  };
}
