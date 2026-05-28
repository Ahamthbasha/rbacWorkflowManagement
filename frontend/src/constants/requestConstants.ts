// components/request/requestConstants.ts
import {
  Clock, CheckCircle, XCircle, AlertCircle, Tag, MessageSquare, History,
  FileText, Send, RefreshCw
} from 'lucide-react';
import type { ComponentType } from 'react';

// Icon map
export const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Clock, CheckCircle, XCircle, AlertCircle, RefreshCw,
  FileText, Tag, MessageSquare, Send, History,
};

// Color maps
export const STATUS_COLOR_MAP: Record<string, string> = {
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

export const PRIORITY_COLOR_MAP: Record<string, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const ACTION_ICON_COLOR: Record<string, string> = {
  FileText: 'text-green-500',
  Tag: 'text-blue-500',
  MessageSquare: 'text-purple-500',
  Send: 'text-indigo-500',
  RefreshCw: 'text-orange-500',
  History: 'text-gray-500',
  CheckCircle: 'text-green-500',
  XCircle: 'text-red-500',
  AlertCircle: 'text-yellow-500',
  Clock: 'text-blue-500',
};