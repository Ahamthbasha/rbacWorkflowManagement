// src/utils/timezoneUtils.ts (Frontend)

export const TIMEZONE = 'Asia/Kolkata';

export const formatDateInIST = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  // Check if date is valid
  if (isNaN(d.getTime())) return 'N/A';
  
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
  if (isNaN(d.getTime())) return 'N/A';
  
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
  if (isNaN(d.getTime())) return 'N/A';
  
  return d.toLocaleTimeString('en-IN', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};