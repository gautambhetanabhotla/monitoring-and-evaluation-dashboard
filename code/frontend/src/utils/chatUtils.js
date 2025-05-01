export const generateId = () => {
    return Math.random().toString(36).substring(2, 10);
  };
  
  export const formatTimestamp = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };