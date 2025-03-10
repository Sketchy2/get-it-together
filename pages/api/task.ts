import { NextApiRequest, NextApiResponse} from "next";
import { AppDataSource } from "../../src/database/ormconfig";
import { Task } from "../../src/entities/Task";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    const taskRepo = AppDataSource.getRepository(Task);
    
    switch (req.method) {
      case "GET": {
        const tasks = await taskRepo.find();
            return res.status(200).json(tasks);
        }
        } 
    } catch (error) {
        console.error("❌ Error handling request:", error);
        console.error(error.stack);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
