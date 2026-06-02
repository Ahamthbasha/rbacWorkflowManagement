export const priorityColor = (p: string): "red" | "orange" | "yellow" | "blue" | "gray" => {
  const m: Record<string, "red" | "orange" | "yellow" | "blue" | "gray"> = {
    critical: "red",
    high: "orange",
    medium: "yellow",
    low: "blue",
    urgent: "red",
  };
  return m[p] ?? "gray";
};

export const statusColor = (
  s: string
): "blue" | "yellow" | "green" | "red" | "orange" | "purple" | "gray" => {
  const m: Record<
    string,
    "blue" | "yellow" | "green" | "red" | "orange" | "purple" | "gray"
  > = {
    submitted: "blue",
    pending: "yellow",
    approved: "green",
    rejected: "red",
    clarification_needed: "orange",
    closed: "gray",
    cancelled: "gray",
    reopened: "purple",
  };
  return m[s] ?? "gray";
};

export const roleBadgeClass = (role: string): string => {
  const m: Record<string, string> = {
    user: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    manager: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    admin: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  };
  return m[role] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
};

export const actionIconPath = (iconName?: string): string => {
  const map: Record<string, string> = {
    FileText: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    Tag: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z",
    CheckCircle: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    RefreshCw: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    MessageCircle: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z",
    Send: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    User: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  };
  return map[iconName ?? ""] ?? map.Tag;
};