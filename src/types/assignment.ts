import { Task } from "./task";

export type { Assignment, User};
// Define interface for an assignment from the API
type Assignment = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  weighting: number;
  members: User[];
  tasks: Task[];
  createdAt: string;
};

type User = {
  id: string;
  email: string;
};
