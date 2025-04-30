// Generate a random ID for new notes
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Get the next available ID
export const getNextId = (notes: any[]): string => {
  if (notes.length === 0) return '1';
  const maxId = Math.max(...notes.map(note => parseInt(note.id)));
  return (maxId + 1).toString();
};

// Format a date to display in the UI
export const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // If less than a day, show relative time
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000));
      if (minutes < 1) {
        return 'Just now';
      }
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // If less than a week, show day of week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  // Otherwise, show full date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format reminder date
export const formatReminderDate = (date: Date): string => {
  const now = new Date();
  const reminderDate = new Date(date);
  const diff = reminderDate.getTime() - now.getTime();
  
  // If today
  if (reminderDate.toDateString() === now.toDateString()) {
    return reminderDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  
  // If tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (reminderDate.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow ${reminderDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }
  
  // If within 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return reminderDate.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  
  // Otherwise show full date
  return reminderDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Count words in a string
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

// Count characters in a string (excluding whitespace)
export const countChars = (text: string): number => {
  return text.replace(/\s/g, '').length;
};

// Get color class based on note color
export const getColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    default: 'bg-white dark:bg-gray-800',
    red: 'bg-red-50 dark:bg-red-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    pink: 'bg-pink-50 dark:bg-pink-900/20',
  };
  
  return colorMap[color] || colorMap.default;
};

// Parse file content for import
export const parseImportedFile = (fileContent: string): any => {
  try {
    const parsed = JSON.parse(fileContent);
    // Remove IDs from imported notes
    return Array.isArray(parsed) ? parsed.map(({ id, ...rest }) => rest) : parsed;
  } catch (error) {
    console.error('Error parsing imported file:', error);
    throw new Error('The selected file is not a valid format');
  }
};

// Prepare notes for export by removing IDs
export const prepareNotesForExport = (notes: any[]): any[] => {
  return notes.map(({ id, ...rest }) => rest);
};

// Debounce function for search and auto-save
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    return new Promise(resolve => {
      timeout = setTimeout(() => {
        const result = func(...args);
        resolve(result);
      }, waitFor);
    });
  };
};