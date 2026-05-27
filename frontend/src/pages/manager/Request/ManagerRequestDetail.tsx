// pages/manager/requests/ManagerRequestDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle,
  User, Mail, Calendar, Tag, MessageSquare, History,
  FileText, Send, X, ThumbsUp, ThumbsDown, HelpCircle, RefreshCw
} from 'lucide-react';
import {
  getRequestById,
  approveRequest,
  rejectRequest,
  requestClarification
} from '../../../api/action/managerAction';
import type { WorkflowRequest, RequestLog, ManagerActionButtons, ActionButtons } from '../../../types/requestTypes';

// Icon map
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock, CheckCircle, XCircle, AlertCircle, RefreshCw,
  FileText, Tag, MessageSquare, Send, History,
};

const STATUS_COLOR_MAP: Record<string, string> = {
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const PRIORITY_COLOR_MAP: Record<string, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const ACTION_ICON_COLOR: Record<string, string> = {
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

// Modal Props Interface
interface ModalProps {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmClass: string;
  loading: boolean;
  children: React.ReactNode;
}

const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin': return 'Admin';
    case 'manager': return 'Manager';
    case 'user': return 'User';
    default: return role;
  }
};

// Type guard to check if actions are manager actions (no 'any' type)
const isManagerActions = (actions: ActionButtons | undefined): actions is ManagerActionButtons => {
  return !!actions && ('canApprove' in actions || 'canReject' in actions || 'canClarify' in actions);
};

// Components
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

const Modal = ({ title, onClose, onConfirm, confirmLabel, confirmClass, loading, children }: ModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
      </div>
      {children}
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${confirmClass}`}>
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const ManagerRequestDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showClarifyModal, setShowClarifyModal] = useState(false);

  const [approveComments, setApproveComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [clarifyQuestion, setClarifyQuestion] = useState('');

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = await getRequestById(requestId);
        if (!cancelled && response.success && response.data) {
          setRequest(response.data);
        } else if (!cancelled) {
          toast.error('Failed to load request details');
        }
      } catch {
        if (!cancelled) toast.error('Failed to load request details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [requestId, refreshKey]);

  const refreshData = () => setRefreshKey(k => k + 1);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await approveRequest(requestId!, { comments: approveComments });
      if (response.success) {
        toast.success('Request approved successfully');
        setShowApproveModal(false);
        setApproveComments('');
        refreshData();
      }
    } catch {
      toast.error('Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason for rejection'); return; }
    setActionLoading(true);
    try {
      const response = await rejectRequest(requestId!, { reason: rejectReason });
      if (response.success) {
        toast.success('Request rejected');
        setShowRejectModal(false);
        setRejectReason('');
        refreshData();
      }
    } catch {
      toast.error('Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClarify = async () => {
    if (!clarifyQuestion.trim()) { toast.error('Please enter your question'); return; }
    setActionLoading(true);
    try {
      const response = await requestClarification(requestId!, { question: clarifyQuestion });
      if (response.success) {
        toast.success('Clarification requested successfully');
        setShowClarifyModal(false);
        setClarifyQuestion('');
        refreshData();
      }
    } catch {
      toast.error('Failed to request clarification');
    } finally {
      setActionLoading(false);
    }
  };

  const getDisplayNameWithRole = (log: RequestLog): string => {
    const name = log.changedByUser?.name ?? 'System';
    const role = log.role;
    return `${name} (${getRoleDisplayName(role)})`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Request not found</h3>
        <button onClick={() => navigate('/manager/requests')} className="mt-4 inline-flex items-center text-blue-600">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Requests
        </button>
      </div>
    );
  }

  // Safely check if actions exist and are manager actions (no 'any' type)
  const actions = request.actions && isManagerActions(request.actions) ? request.actions : null;
  const canTakeAction = actions && (actions.canApprove || actions.canReject || actions.canClarify);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <button onClick={() => navigate('/manager/requests')} className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Requests
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{request.title}</h1>
              <div className="flex flex-wrap gap-3 mt-3">
                {request.statusDisplay && <StatusBadge display={request.statusDisplay} />}
                {request.priorityDisplay && <PriorityBadge display={request.priorityDisplay} />}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {request.categoryLabel || request.category}
                </span>
              </div>
            </div>
            {canTakeAction && actions && (
              <div className="flex flex-wrap gap-2">
                {actions.canApprove && (
                  <button onClick={() => setShowApproveModal(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2" /> Approve
                  </button>
                )}
                {actions.canReject && (
                  <button onClick={() => setShowRejectModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center">
                    <ThumbsDown className="h-4 w-4 mr-2" /> Reject
                  </button>
                )}
                {actions.canClarify && (
                  <button onClick={() => setShowClarifyModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" /> Ask Clarification
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{request.description}</p>
          </div>

          {request.reopenReason && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-orange-900">Request Reopened by Admin</h4>
                  <p className="text-sm text-orange-700 mt-1">{request.reopenReason}</p>
                  {request.reopenedAtFormatted && <p className="text-xs text-orange-600 mt-2">Reopened on: {request.reopenedAtFormatted}</p>}
                </div>
              </div>
            </div>
          )}

          {request.clarificationRequest && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-900 mb-2">Clarification Requested by Manager</h4>
              <p className="text-purple-800">{request.clarificationRequest}</p>
              {request.clarificationResponse && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-1">User's Response:</p>
                  <p className="text-purple-800">{request.clarificationResponse}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <InfoRow icon={<User className="h-4 w-4 text-gray-400" />} label="Requested by" value={request.user?.name ?? 'Unknown'} />
            <InfoRow icon={<Mail className="h-4 w-4 text-gray-400" />} label="Email" value={request.user?.email ?? 'Unknown'} />
            <InfoRow icon={<Calendar className="h-4 w-4 text-gray-400" />} label="Submitted on" value={request.submittedAtFormatted || request.submittedAt} />
            {request.user?.department && <InfoRow icon={<Tag className="h-4 w-4 text-gray-400" />} label="Department" value={request.user.department} />}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Request History & Activity</h2>
          </div>
        </div>
        <div className="p-6">
          {(request.logs || []).length === 0 ? (
            <p className="text-center text-gray-500 py-8">No activity recorded yet</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-6">
                {request.logs?.map((log: RequestLog) => (
                  <div key={log.id} className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                      <LogIcon iconName={log.actionIconName || 'History'} />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium">{log.actionLabel || log.action}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        By: {getDisplayNameWithRole(log)} · {log.timestampFormatted}
                      </p>
                      {log.comments && <p className="text-sm text-gray-600 mt-2">{log.comments}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showApproveModal && (
        <Modal title="Approve Request" onClose={() => setShowApproveModal(false)} onConfirm={handleApprove}
          confirmLabel="Confirm Approve" confirmClass="bg-green-600 hover:bg-green-700" loading={actionLoading}>
          <textarea value={approveComments} onChange={e => setApproveComments(e.target.value)}
            placeholder="Optional: Add comments..." rows={3}
            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700" />
        </Modal>
      )}

      {showRejectModal && (
        <Modal title="Reject Request" onClose={() => setShowRejectModal(false)} onConfirm={handleReject}
          confirmLabel="Confirm Reject" confirmClass="bg-red-600 hover:bg-red-700" loading={actionLoading}>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejection..." rows={3} required
            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700" />
        </Modal>
      )}

      {showClarifyModal && (
        <Modal title="Request Clarification" onClose={() => setShowClarifyModal(false)} onConfirm={handleClarify}
          confirmLabel="Send Question" confirmClass="bg-purple-600 hover:bg-purple-700" loading={actionLoading}>
          <textarea value={clarifyQuestion} onChange={e => setClarifyQuestion(e.target.value)}
            placeholder="Enter your question for the user..." rows={3}
            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700" />
        </Modal>
      )}
    </div>
  );
};

export default ManagerRequestDetail;