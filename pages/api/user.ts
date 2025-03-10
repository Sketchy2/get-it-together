import { NextApiRequest, NextApiResponse } from "next";
import { AppDataSource } from "../../src/database/ormconfig";
import { User } from "../../src/entities/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    
    const users = await userRepo.find();
    
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    
    // Print stack trace for more details
    console.error(error.stack);
    
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
