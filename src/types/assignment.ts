import { Task } from "./task";

export type { Assignment, User, FileAttachment, AssignmentLink };
// Define interface for an assignment from the API
type Assignment = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  deadline: string;
  weighting: number;
  members: User[];
  tasks: Task[];
  files: FileAttachment[];
  links: AssignmentLink[];
};

type FileAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: string;
};

type AssignmentLink = { title: string; url: string };

type User = {
  id: string;
  name: string;
  email?: string;
};
