// pages/admin/Request/AdminRequestDetail.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle,
  User, Mail, Calendar, Tag, MessageSquare, History,
  FileText, Send, X, RefreshCw,
} from 'lucide-react';
import {
  getRequestById,
  getRequestLogs,
  closeRequest,
  reopenRequest,
} from '../../../api/action/adminAction';
import type { WorkflowRequest, RequestLog, ActionButtons, AdminActionButtons } from '../../../types/requestTypes';

// ─── Icon map — matches iconName strings sent by the backend ─────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock, CheckCircle, XCircle, AlertCircle, RefreshCw,
  FileText, Tag, MessageSquare, Send, History,
};

// Color → Tailwind class maps
const STATUS_COLOR_MAP: Record<string, string> = {
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  blue:   'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400',
  green:  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400',
  red:    'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  gray:   'bg-gray-100   text-gray-800   dark:bg-gray-900/30   dark:text-gray-400',
  teal:   'bg-teal-100   text-teal-800   dark:bg-teal-900/30   dark:text-teal-400',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const PRIORITY_COLOR_MAP: Record<string, string> = {
  green:  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  red:    'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
};

const ACTION_ICON_COLOR: Record<string, string> = {
  FileText:     'text-green-500',
  Tag:          'text-blue-500',
  MessageSquare: 'text-purple-500',
  Send:         'text-indigo-500',
  RefreshCw:    'text-orange-500',
  History:      'text-gray-500',
  CheckCircle:  'text-green-500',
  XCircle:      'text-red-500',
  AlertCircle:  'text-yellow-500',
  Clock:        'text-blue-500',
};

// Get role display name
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin': return 'Admin';
    case 'manager': return 'Manager';
    case 'user': return 'User';
    default: return role;
  }
};

// Type guard to check if actions are admin actions
const isAdminActions = (actions: ActionButtons | undefined): actions is AdminActionButtons => {
  return !!actions && ('canClose' in actions || 'canReopen' in actions);
};

// ─── Components declared OUTSIDE render ─────────────────────────────────────
const StatusBadge = ({ display }: { display: { label: string; color: string; iconName: string } }) => {
  const Icon = ICON_MAP[display.iconName] ?? Clock;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLOR_MAP[display.color] ?? ''}`}>
      <Icon className="h-4 w-4 mr-1" />
      {display.label}
    </span>
  );
};

const PriorityBadge = ({ display }: { display: { label: string; color: string } }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLOR_MAP[display.color] ?? ''}`}>
    {display.label}
  </span>
);

const LogIcon = ({ iconName }: { iconName: string }) => {
  const Icon = ICON_MAP[iconName] ?? History;
  const color = ACTION_ICON_COLOR[iconName] ?? 'text-gray-500';
  return <Icon className={`h-4 w-4 ${color}`} />;
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center space-x-3 text-sm">
    {icon}
    <span className="text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
  </div>
);

const Modal = ({
  title, onClose, onConfirm, confirmLabel, confirmClass, loading, children,
}: {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmClass: string;
  loading: boolean;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors ${confirmClass}`}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminRequestDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [closureNote, setClosureNote] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  const requestIdRef = useRef(requestId);
  useEffect(() => { requestIdRef.current = requestId; }, [requestId]);

  // Fetch data
  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [requestRes, logsRes] = await Promise.all([
          getRequestById(requestId),
          getRequestLogs(requestId),
        ]);
        if (cancelled) return;

        if (requestRes.success && requestRes.data) setRequest(requestRes.data);
        else toast.error('Failed to load request details');

        if (logsRes.success && logsRes.data) setLogs(logsRes.data);
      } catch {
        if (!cancelled) toast.error('Failed to load request details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [requestId, refreshCount]);

  // Actions
  const handleClose = async () => {
    setActionLoading(true);
    try {
      const response = await closeRequest(requestIdRef.current!, { closureNote: closureNote || undefined });
      if (response.success) {
        toast.success('Request closed successfully');
        setShowCloseModal(false);
        setClosureNote('');
        setRefreshCount(n => n + 1);
      } else {
        toast.error(response.message || 'Failed to close request');
      }
    } catch {
      toast.error('Failed to close request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async () => {
    if (!reopenReason.trim()) { toast.error('Please provide a reason for reopening'); return; }
    setActionLoading(true);
    try {
      const response = await reopenRequest(requestIdRef.current!, { reason: reopenReason });
      if (response.success) {
        toast.success('Request reopened successfully');
        setShowReopenModal(false);
        setReopenReason('');
        setRefreshCount(n => n + 1);
      } else {
        toast.error(response.message || 'Failed to reopen request');
      }
    } catch {
      toast.error('Failed to reopen request');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to get display name with role
  const getDisplayNameWithRole = (log: RequestLog): string => {
    const name = log.changedByUser?.name ?? 'System';
    const role = log.role;
    const roleDisplay = getRoleDisplayName(role);
    return `${name} (${roleDisplay})`;
  };

  // Safely check if actions exist and are admin actions
  const adminActions = request?.actions && isAdminActions(request.actions) ? request.actions : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Request not found</h3>
        <button
          onClick={() => navigate('/admin/requests')}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">

      {/* Back */}
      <button
        onClick={() => navigate('/admin/requests')}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Requests
      </button>

      {/* Request Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {request.title}
              </h1>
              <div className="flex flex-wrap gap-3 mt-3">
                {request.statusDisplay && <StatusBadge display={request.statusDisplay} />}
                {request.priorityDisplay && <PriorityBadge display={request.priorityDisplay} />}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {request.categoryLabel || request.category}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {adminActions?.canClose && (
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Request
                </button>
              )}
              {adminActions?.canReopen && (
                <button
                  onClick={() => setShowReopenModal(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reopen Request
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{request.description}</p>
          </div>

          {/* Clarification block */}
          {request.clarificationRequest && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                Clarification Requested
              </h4>
              <p className="text-purple-800 dark:text-purple-400">{request.clarificationRequest}</p>
              {request.clarificationResponse && (
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-1">User's Response:</p>
                  <p className="text-purple-800 dark:text-purple-400">{request.clarificationResponse}</p>
                </div>
              )}
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <InfoRow icon={<User className="h-4 w-4 text-gray-400" />} label="Requested by" value={request.user?.name ?? 'Unknown'} />
            <InfoRow icon={<Mail className="h-4 w-4 text-gray-400" />} label="Email" value={request.user?.email ?? 'Unknown'} />
            <InfoRow icon={<Calendar className="h-4 w-4 text-gray-400" />} label="Submitted on" value={request.submittedAtFormatted || request.submittedAt} />
            {request.manager && (
              <InfoRow icon={<User className="h-4 w-4 text-gray-400" />} label="Manager" value={request.manager.name} />
            )}
            {request.approvedAtFormatted && (
              <InfoRow icon={<CheckCircle className="h-4 w-4 text-gray-400" />} label="Approved on" value={request.approvedAtFormatted} />
            )}
            {request.rejectedAtFormatted && (
              <InfoRow icon={<XCircle className="h-4 w-4 text-gray-400" />} label="Rejected on" value={request.rejectedAtFormatted} />
            )}
            {request.closedAtFormatted && (
              <InfoRow icon={<CheckCircle className="h-4 w-4 text-gray-400" />} label="Closed on" value={request.closedAtFormatted} />
            )}
            {request.reopenedAtFormatted && (
              <InfoRow icon={<RefreshCw className="h-4 w-4 text-gray-400" />} label="Reopened on" value={request.reopenedAtFormatted} />
            )}
          </div>

          {/* Comments */}
          {request.comments && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comments</h4>
              <p className="text-gray-600 dark:text-gray-400">{request.comments}</p>
            </div>
          )}

          {/* Reopen reason */}
          {request.reopenReason && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-2">Reopen Reason</h4>
              <p className="text-orange-800 dark:text-orange-400">{request.reopenReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Request History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request History</h2>
          </div>
        </div>
        <div className="p-6">
          {logs.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No activity recorded yet</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-6">
                {logs.map(log => (
                  <div key={log.id} className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <LogIcon iconName={log.actionIconName || 'History'} />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{log.actionLabel || log.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          By: {getDisplayNameWithRole(log)} · {log.timestampFormatted}
                        </p>
                      </div>
                      {log.comments && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{log.comments}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close Modal */}
      {showCloseModal && (
        <Modal
          title="Close Request"
          onClose={() => setShowCloseModal(false)}
          onConfirm={handleClose}
          confirmLabel="Confirm Close"
          confirmClass="bg-gray-600 hover:bg-gray-700"
          loading={actionLoading}
        >
          <textarea
            value={closureNote}
            onChange={e => setClosureNote(e.target.value)}
            placeholder="Optional: Add closure notes..."
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </Modal>
      )}

      {/* Reopen Modal */}
      {showReopenModal && (
        <Modal
          title="Reopen Request"
          onClose={() => setShowReopenModal(false)}
          onConfirm={handleReopen}
          confirmLabel="Confirm Reopen"
          confirmClass="bg-orange-600 hover:bg-orange-700"
          loading={actionLoading}
        >
          <textarea
            value={reopenReason}
            onChange={e => setReopenReason(e.target.value)}
            placeholder="Please provide a reason for reopening..."
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </Modal>
      )}
    </div>
  );
};

export default AdminRequestDetail;