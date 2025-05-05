import { Task } from "@/types/task";
import { isLate } from "./utils";

export {calculateProgress,calculateDaysRemaining,getCardBgColor}


  /**
   * Utility function to calculate days remaining -
   */
const calculateDaysRemaining = (deadline: string): number => {
    const dueDateTime = new Date(deadline).getTime();
    const currentTime = new Date().getTime();
    return Math.ceil((dueDateTime - currentTime) / (1000 * 60 * 60 * 24));
}
  
  /**
   * Utility function to calculate progress
   */
  const calculateProgress = (tasks: Task[]): number => {
      if (!Array.isArray(tasks) || tasks.length === 0) return 0;
      
    const totalWeight = tasks.reduce((sum, task) => sum + (task.weight?task.weight:1), 0);
    if (totalWeight === 0) return 0;

    const completedWeight = tasks
      .filter((task) => task.status === "Completed")
      .reduce((sum, task) => sum + (task.weight?task.weight:1), 0);

    return Math.round((completedWeight / totalWeight) * 100);
  };


    /**
   * Get background color for assignment card
   */
const getCardBgColor =
    (tasks:Task[],deadline:string): string => {
        const progress = calculateProgress(tasks);
    
        if (progress === 100) {
            return "#647A67"; // Green color for completed items
        }
    
        if (isLate(deadline)) {
            return "#900100"; // Red color for late assignments
        }
    
        return "#DD992B"; // Default gold color for active
    };