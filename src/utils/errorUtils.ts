/**
 * Handle errors consistently across the application
 */
export const handleError = (error: unknown, message: string): string => {
    console.error(`${message}:`, error);
    
    if (error instanceof Error) {
      return `${message}: ${error.message}`;
    }
    
    return message;
  };