
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin': return 'Admin';
    case 'manager': return 'Manager';
    case 'user': return 'User';
    default: return role;
  }
};

export const formatDate = (date?: string): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const toSafeString = (value: unknown, fallback = 'N/A'): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};