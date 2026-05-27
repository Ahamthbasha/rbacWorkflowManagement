// pages/admin/Request/AdminRequestDetail.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Mail,
  Calendar,
  Tag,
  MessageSquare,
  History,
  FileText,
  Send,
  X,
  RefreshCw
} from 'lucide-react';
import { 
  getRequestById, 
  getRequestLogs, 
  closeRequest, 
  reopenRequest 
} from '../../../api/action/adminAction';
import type { WorkflowRequest, RequestLog } from '../../../types/requestTypes';

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
}

const AdminRequestDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);

  // Form data
  const [closureNote, setClosureNote] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  // Used only for imperative refresh after close/reopen actions
  const [refreshCount, setRefreshCount] = useState(0);
  const triggerRefresh = () => setRefreshCount(n => n + 1);

  // Always reflects latest requestId without being a dep of the fetch effect
  const requestIdRef = useRef(requestId);
  useEffect(() => {
    requestIdRef.current = requestId;
  }, [requestId]);

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [requestRes, logsRes] = await Promise.all([
          getRequestById(requestId),
          getRequestLogs(requestId)
        ]);

        if (cancelled) return;

        if (requestRes.success && requestRes.data) {
          setRequest(requestRes.data);
        } else {
          toast.error('Failed to load request details');
        }

        if (logsRes.success && logsRes.data) {
          setLogs(logsRes.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load request details');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [requestId, refreshCount]); // requestId handles route changes; refreshCount handles manual refresh

  const handleClose = async () => {
    setActionLoading(true);
    try {
      const response = await closeRequest(requestIdRef.current!, { closureNote: closureNote || undefined });
      if (response.success) {
        toast.success('Request closed successfully');
        setShowCloseModal(false);
        setClosureNote('');
        triggerRefresh();
      } else {
        toast.error(response.message || 'Failed to close request');
      }
    } catch (error) {
      console.error('Error closing request:', error);
      toast.error('Failed to close request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async () => {
    if (!reopenReason.trim()) {
      toast.error('Please provide a reason for reopening');
      return;
    }

    setActionLoading(true);
    try {
      const response = await reopenRequest(requestIdRef.current!, { reason: reopenReason });
      if (response.success) {
        toast.success('Request reopened successfully');
        setShowReopenModal(false);
        setReopenReason('');
        triggerRefresh();
      } else {
        toast.error(response.message || 'Failed to reopen request');
      }
    } catch (error) {
      console.error('Error reopening request:', error);
      toast.error('Failed to reopen request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, StatusConfig> = {
      submitted: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Submitted' },
      pending: { icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Pending' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Approved' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Rejected' },
      clarification_needed: { icon: AlertCircle, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Clarification Needed' },
      closed: { icon: CheckCircle, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', label: 'Closed' },
      cancelled: { icon: XCircle, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Cancelled' }
    };
    const { icon: Icon, color, label } = config[status] || config.submitted;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, string> = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      access: 'Access Request',
      software: 'Software Request',
      hardware: 'Hardware Request',
      leave: 'Leave Request',
      budget: 'Budget Request',
      other: 'Other'
    };
    return labels[category] || category;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <FileText className="h-4 w-4 text-green-500" />;
      case 'status_change': return <Tag className="h-4 w-4 text-blue-500" />;
      case 'clarification_requested': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'clarification_responded': return <Send className="h-4 w-4 text-indigo-500" />;
      default: return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLabel = (log: RequestLog) => {
    if (log.action === 'create') return 'Request Created';
    if (log.action === 'status_change') return `Status Changed: ${log.oldStatus || 'N/A'} → ${log.newStatus}`;
    if (log.action === 'clarification_requested') return 'Clarification Requested';
    if (log.action === 'clarification_responded') return 'Clarification Response Submitted';
    if (log.action === 'update') return 'Request Updated';
    return 'Activity';
  };

  const canClose = () => request && request.status === 'approved';
  const canReopen = () => request && (request.status === 'closed' || request.status === 'cancelled');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/requests')}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Requests
      </button>

      {/* Request Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {request.title}
              </h1>
              <div className="flex flex-wrap gap-3 mt-3">
                {getStatusBadge(request.status)}
                {getPriorityBadge(request.priority)}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {getCategoryLabel(request.category)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {canClose() && (
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Request
                </button>
              )}
              {canReopen() && (
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

        {/* Request Details */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          {/* Clarification Section */}
          {request.clarificationRequest && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                Clarification Requested
              </h4>
              <p className="text-purple-800 dark:text-purple-400">
                {request.clarificationRequest}
              </p>
              {request.clarificationResponse && (
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-1">
                    User's Response:
                  </p>
                  <p className="text-purple-800 dark:text-purple-400">
                    {request.clarificationResponse}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Request Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Requested by:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {request.user?.name || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {request.user?.email || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Submitted on:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(request.submittedAt)}
              </span>
            </div>
            {request.manager && (
              <div className="flex items-center space-x-3 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Manager:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {request.manager.name}
                </span>
              </div>
            )}
          </div>

          {/* Comments */}
          {request.comments && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Comments
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {request.comments}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Request Logs/History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Request History
            </h2>
          </div>
        </div>
        <div className="p-6">
          {logs.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No activity recorded yet
            </p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="space-y-6">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getActionLabel(log)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          By: {log.role} | {formatDate(log.timestamp)}
                        </p>
                      </div>
                      {log.comments && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {log.comments}
                        </p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Close Request
              </h3>
              <button onClick={() => setShowCloseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={closureNote}
              onChange={(e) => setClosureNote(e.target.value)}
              placeholder="Optional: Add closure notes..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4 dark:bg-gray-700"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reopen Request
              </h3>
              <button onClick={() => setShowReopenModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Please provide a reason for reopening..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 mb-4 dark:bg-gray-700"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReopenModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReopen}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Reopen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestDetail;