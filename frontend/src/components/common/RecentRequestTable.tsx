// components/common/RecentRequestTable.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  RotateCcw,
  Ban,
} from 'lucide-react';

export interface RecentRequest {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  categoryLabel: string;
  statusDisplay: { label: string; color: string; iconName: string };
  priorityDisplay: { label: string; color: string };
  submittedAtFormatted: string;
}

const STATUS_ICONS: Record<string, React.ReactElement> = {
  approved:             <CheckCircle className="h-5 w-5 text-green-500" />,
  rejected:             <XCircle     className="h-5 w-5 text-red-500" />,
  pending:              <Clock       className="h-5 w-5 text-yellow-500" />,
  clarification_needed: <AlertCircle className="h-5 w-5 text-purple-500" />,
  closed:               <CheckCircle className="h-5 w-5 text-gray-500" />,
  cancelled:            <Ban         className="h-5 w-5 text-red-500" />,
  reopened:             <RotateCcw   className="h-5 w-5 text-orange-500" />,
  submitted:            <FileText    className="h-5 w-5 text-blue-500" />,
};

const STATUS_BADGE: Record<string, string> = {
  green:  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',
  red:    'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  blue:   'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300',
  gray:   'bg-gray-100   text-gray-800   dark:bg-gray-700      dark:text-gray-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

const PRIORITY_BADGE: Record<string, string> = {
  red:    'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  green:  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',
  blue:   'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300',
};

const fallback = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

interface RecentRequestsTableProps {
  requests: RecentRequest[];
  viewRoute?: (id: string) => string;
}

const RecentRequestsTable = ({
  requests,
  viewRoute = (id) => `/requests/${id}`,
}: RecentRequestsTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              {['Title', 'Category', 'Priority', 'Status', 'Submitted', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No requests found
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {req.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {req.categoryLabel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[req.priorityDisplay.color] ?? fallback}`}>
                      {req.priorityDisplay.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {STATUS_ICONS[req.status] ?? STATUS_ICONS.submitted}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[req.statusDisplay.color] ?? fallback}`}>
                        {req.statusDisplay.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {req.submittedAtFormatted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => navigate(viewRoute(req.id))}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentRequestsTable;