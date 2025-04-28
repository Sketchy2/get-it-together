import { useCallback } from "react"
export  {isLate,formatDate}

  const isLate = (dueDate: string): boolean => {
    return new Date(dueDate) < new Date()
  }


    /**
     * Utility function to format date for display
     */
    const formatDate = (dateString: string): string => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };