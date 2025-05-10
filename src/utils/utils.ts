import { RefObject, useEffect } from "react";

export { isLate, formatDate, useOnClickOutside, };

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


    const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
      ref: RefObject<T|null>,
      handler: (event: MouseEvent | TouchEvent) => void
    ): void => {
      useEffect(() => {
        // Define our listener
        const listener = (event: MouseEvent | TouchEvent) => {
          // Do nothing if clicking ref's element or descendent elements
          if (!ref.current || ref.current.contains(event.target as Node)) {
            return;
          }
          
          handler(event);
        };
        
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        
        // Clean up on unmount
        return () => {
          document.removeEventListener('mousedown', listener);
          document.removeEventListener('touchstart', listener);
        };
      }, [ref, handler]); // Re-run if ref or handler changes
    };