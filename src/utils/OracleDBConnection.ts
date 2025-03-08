import oracledb, { Connection } from 'oracledb';  

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    connectString: process.env.DB_CONNECT_STRING
};


if (!dbConfig.connectString || !dbConfig.user || !dbConfig.password) {
    throw new Error(
      "OracleDB connection string, username and password are required"
    )}


    const clientPromise = new Promise<Connection>(async (resolve, reject) => {
        try {
          const client = await oracledb.getConnection(dbConfig); // Get the connection
          resolve(client); // Resolve with the connection
        } catch (e) {
          reject(e); 
        }
      });
       
      // Export a module-scoped Promise<Surreal>. By doing this in a
      // separate module, the client can be shared across functions.
      export default clientPromise