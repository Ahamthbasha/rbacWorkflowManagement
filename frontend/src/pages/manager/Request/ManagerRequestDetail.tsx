// pages/manager/requests/ManagerRequestDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle,
  User, Mail, Calendar, Tag, MessageSquare, History,
  FileText, Send, X, ThumbsUp, ThumbsDown, HelpCircle
  // ↑ removed unused 'Check'
} from 'lucide-react';
import {
  getRequestById, getRequestLogs,
  approveRequest, rejectRequest, requestClarification
} from '../../../api/action/managerAction';
import type { WorkflowRequest, RequestLog } from '../../../types/requestTypes';

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
}

const ManagerRequestDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
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
        const [requestRes, logsRes] = await Promise.all([
          getRequestById(requestId),
          getRequestLogs(requestId),
        ]);
        if (!cancelled) {
          if (requestRes.success && requestRes.data) {
            setRequest(requestRes.data);
          } else {
            toast.error('Failed to load request details');
          }
          if (logsRes.success && logsRes.data) {
            setLogs(logsRes.data);
          }
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

    load();
    return () => { cancelled = true; };
  }, [requestId, refreshKey]);

  const refreshData = () => setRefreshKey((k) => k + 1);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await approveRequest(requestId!, { comments: approveComments });
      if (response.success) {
        toast.success('Request approved successfully');
        setShowApproveModal(false);
        setApproveComments('');
        refreshData();
      } else {
        toast.error(response.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setActionLoading(true);
    try {
      const response = await rejectRequest(requestId!, { reason: rejectReason });
      if (response.success) {
        toast.success('Request rejected');
        setShowRejectModal(false);
        setRejectReason('');
        refreshData();
      } else {
        toast.error(response.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClarify = async () => {
    if (!clarifyQuestion.trim()) {
      toast.error('Please enter your question');
      return;
    }
    setActionLoading(true);
    try {
      const response = await requestClarification(requestId!, { question: clarifyQuestion });
      if (response.success) {
        toast.success('Clarification requested successfully');
        setShowClarifyModal(false);
        setClarifyQuestion('');
        refreshData();
      } else {
        toast.error(response.message || 'Failed to request clarification');
      }
    } catch (error) {
      console.error('Error requesting clarification:', error);
      toast.error('Failed to request clarification');
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
      cancelled: { icon: XCircle, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Cancelled' },
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
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      access: 'Access Request', software: 'Software Request', hardware: 'Hardware Request',
      leave: 'Leave Request', budget: 'Budget Request', other: 'Other',
    };
    return labels[category] || category;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

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

  const canTakeAction = () =>
    request && ['submitted', 'pending', 'clarification_needed'].includes(request.status);

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
          onClick={() => navigate('/manager/requests')}
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
      <button
        onClick={() => navigate('/manager/requests')}
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{request.title}</h1>
              <div className="flex flex-wrap gap-3 mt-3">
                {getStatusBadge(request.status)}
                {getPriorityBadge(request.priority)}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {getCategoryLabel(request.category)}
                </span>
              </div>
            </div>
            {canTakeAction() && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => setShowClarifyModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Ask Clarification
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{request.description}</p>
          </div>

          {request.clarificationRequest && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                Clarification Requested by Manager
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Requested by:</span>
              <span className="font-medium text-gray-900 dark:text-white">{request.user?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-medium text-gray-900 dark:text-white">{request.user?.email || 'Unknown'}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Submitted on:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatDate(request.submittedAt)}</span>
            </div>
            {request.user?.department && (
              <div className="flex items-center space-x-3 text-sm">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Department:</span>
                <span className="font-medium text-gray-900 dark:text-white">{request.user.department}</span>
              </div>
            )}
          </div>

          {request.comments && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comments</h4>
              <p className="text-gray-600 dark:text-gray-400">{request.comments}</p>
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
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="space-y-6">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{getActionLabel(log)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            By: {log.role} | {formatDate(log.timestamp)}
                          </p>
                        </div>
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

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Approve Request</h3>
              <button onClick={() => setShowApproveModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={approveComments}
              onChange={(e) => setApproveComments(e.target.value)}
              placeholder="Optional: Add comments..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4 dark:bg-gray-700"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleApprove} disabled={actionLoading} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
                {actionLoading ? 'Processing...' : 'Confirm Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Request</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 mb-4 dark:bg-gray-700"
              required
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
                {actionLoading ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarify Modal */}
      {showClarifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Clarification</h3>
              <button onClick={() => setShowClarifyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={clarifyQuestion}
              onChange={(e) => setClarifyQuestion(e.target.value)}
              placeholder="Enter your question for the user..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 mb-4 dark:bg-gray-700"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowClarifyModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleClarify} disabled={actionLoading} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50">
                {actionLoading ? 'Sending...' : 'Send Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRequestDetail;