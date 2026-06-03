// src/utils/timezoneUtils.ts

/**
 * Convert a date to IST (Indian Standard Time) consistently
 * IST is UTC+5:30
 */

export const TIMEZONE = 'Asia/Kolkata';

export const formatInIST = (date: Date | string | null | undefined): Date => {
  if (!date) return new Date();
  
  const d = new Date(date);
  // Return the date as-is but we'll format it correctly
  return d;
};

export const formatDateInIST = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export const formatDateOnlyInIST = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatTimeOnlyInIST = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// For database queries - get start/end of day in IST for filtering
export const getISTDateRange = (date: Date | string): { start: Date; end: Date } => {
  const d = new Date(date);
  
  // Create date in IST timezone
  const istDate = new Date(d.toLocaleString('en-US', { timeZone: TIMEZONE }));
  
  // Start of day in IST
  const start = new Date(istDate);
  start.setHours(0, 0, 0, 0);
  
  // End of day in IST
  const end = new Date(istDate);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// Get current time in IST for database storage
export const getCurrentISTDate = (): Date => {
  const now = new Date();
  const istString = now.toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(istString);
};