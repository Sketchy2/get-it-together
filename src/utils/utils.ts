export  {isLate,formatDate}

  const isLate = (deadline: string): boolean => {
    return new Date(deadline) < new Date()
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