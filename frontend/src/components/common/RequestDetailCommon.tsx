
import React from 'react';
import { User, Mail, Calendar, History, FileText, ArrowLeft, X, AlertCircle } from 'lucide-react';
import type { WorkflowRequest, RequestLog } from '../../types/requestTypes';
import { ICON_MAP, STATUS_COLOR_MAP, PRIORITY_COLOR_MAP, ACTION_ICON_COLOR } from '../../constants/requestConstants';
import { toSafeString } from '../../utils/requestUtils';

export const StatusBadge = ({ display }: { display: { label: string; color: string; iconName: string } }) => {
  const Icon = ICON_MAP[display.iconName] ?? ICON_MAP.Clock;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLOR_MAP[display.color] ?? ''}`}>
      <Icon className="h-4 w-4 mr-1" />
      {display.label}
    </span>
  );
};

export const PriorityBadge = ({ display }: { display: { label: string; color: string } }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLOR_MAP[display.color] ?? ''}`}>
    {display.label}
  </span>
);

export const LogIcon = ({ iconName }: { iconName: string }) => {
  const Icon = ICON_MAP[iconName] ?? ICON_MAP.History;
  const color = ACTION_ICON_COLOR[iconName] ?? 'text-gray-500';
  return <Icon className={`h-4 w-4 ${color}`} />;
};

export const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center space-x-3 text-sm">
    {icon}
    <span className="text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
  </div>
);

export interface ModalProps {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmClass: string;
  loading: boolean;
  children: React.ReactNode;
}

export const Modal = ({ title, onClose, onConfirm, confirmLabel, confirmClass, loading, children }: ModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading} className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${confirmClass}`}>
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export const BackButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900">
    <ArrowLeft className="h-4 w-4 mr-2" />
    {label}
  </button>
);

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
);

export const NotFoundState = ({ onBack, backLabel }: { onBack: () => void; backLabel: string }) => (
  <div className="text-center py-12">
    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Request not found</h3>
    <button onClick={onBack} className="mt-4 inline-flex items-center text-blue-600">
      <ArrowLeft className="h-4 w-4 mr-2" />
      {backLabel}
    </button>
  </div>
);

export const ClarificationBlock = ({ request }: { request: WorkflowRequest }) => {
  if (!request.clarificationRequest) return null;
  
  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
      <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-400 mb-2">
        Clarification Requested by Manager
      </h4>
      <p className="text-purple-800 dark:text-purple-300">{toSafeString(request.clarificationRequest)}</p>
      {request.clarificationResponse && (
        <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
          <p className="text-sm font-semibold text-purple-900 dark:text-purple-400 mb-1">User's Response:</p>
          <p className="text-purple-800 dark:text-purple-300">{toSafeString(request.clarificationResponse)}</p>
        </div>
      )}
    </div>
  );
};

export const ReopenReasonBlock = ({ request }: { request: WorkflowRequest }) => {
  if (!request.reopenReason) return null;
  
  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-400">Request Reopened by Admin</h4>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">{toSafeString(request.reopenReason)}</p>
          {request.reopenedAtFormatted && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Reopened on: {toSafeString(request.reopenedAtFormatted)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const RequestInfoGrid = ({ request, additionalInfo = [] }: { 
  request: WorkflowRequest; 
  additionalInfo?: Array<{ icon: React.ReactNode; label: string; value: string }>;
}) => {
  const baseInfo = [
    { icon: <User className="h-4 w-4 text-gray-400" />, label: "Requested by", value: toSafeString(request.user?.name, 'Unknown') },
    { icon: <Mail className="h-4 w-4 text-gray-400" />, label: "Email", value: toSafeString(request.user?.email, 'Unknown') },
    { icon: <Calendar className="h-4 w-4 text-gray-400" />, label: "Submitted on", value: toSafeString(request.submittedAtFormatted ?? request.submittedAt) },
    ...additionalInfo
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      {baseInfo.map((info, idx) => (
        <InfoRow key={idx} icon={info.icon} label={info.label} value={info.value} />
      ))}
    </div>
  );
};

export const RequestHistory = ({ logs, getDisplayNameWithRole }: { 
  logs: RequestLog[]; 
  getDisplayNameWithRole: (log: RequestLog) => string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <History className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request History & Activity</h2>
      </div>
    </div>
    <div className="p-6">
      {logs.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No activity recorded yet</p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-6">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <LogIcon iconName={log.actionIconName || 'History'} />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{log.actionLabel || log.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    By: {getDisplayNameWithRole(log)} · {log.timestampFormatted}
                  </p>
                  {log.comments && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{log.comments}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);