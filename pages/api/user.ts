import { NextApiRequest, NextApiResponse } from "next";
import { initDB } from "../../src/utils/db";
import { AppDataSource } from "../../src/database/ormconfig";
import { User } from "../../src/entities/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await initDB();
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
