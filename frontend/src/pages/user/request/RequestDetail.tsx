// pages/user/request/RequestDetail.tsx
import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { getRequestById, getRequestLogs, respondToClarification } from '../../../api/action/userAction';
import type { WorkflowRequest, RequestLog } from '../../../types/requestTypes';

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
}

const RequestDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationResponse, setClarificationResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    if (!requestId) return;

    const abortController = new AbortController();

    const run = async () => {
      setLoading(true);
      try {
        const [requestRes, logsRes] = await Promise.all([
          getRequestById(requestId),
          getRequestLogs(requestId),
        ]);

        if (abortController.signal.aborted) return;

        if (requestRes.success && requestRes.data) {
          setRequest(requestRes.data);
        } else {
          toast.error('Failed to load request details');
        }

        if (logsRes.success && logsRes.data) {
          setLogs(logsRes.data);
        }
      } catch (error) {
        if (abortController.signal.aborted) return;
        console.error('Error fetching request details:', error);
        toast.error('Failed to load request details');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      abortController.abort();
    };
  }, [requestId, fetchTrigger]);

  const handleClarificationResponse = async () => {
    if (!clarificationResponse.trim()) {
      toast.error('Please enter your response');
      return;
    }

    setSubmitting(true);
    try {
      const response = await respondToClarification(requestId!, { response: clarificationResponse });
      if (response.success) {
        toast.success('Response submitted successfully');
        setShowClarificationModal(false);
        setClarificationResponse('');
        setFetchTrigger(prev => prev + 1);
      } else {
        toast.error(response.message || 'Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
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
    const { icon: Icon, color, label } = config[status] ?? config.submitted;
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
    return labels[category] ?? category;
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
      case 'edit': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'resubmit': return <Send className="h-4 w-4 text-indigo-500" />;
      case 'status_change': return <Tag className="h-4 w-4 text-blue-500" />;
      case 'clarification_requested': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'clarification_responded': return <Send className="h-4 w-4 text-indigo-500" />;
      case 'reopen': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLabel = (log: RequestLog) => {
    if (log.action === 'create') return 'Request Created';
    if (log.action === 'edit') return 'Request Edited';
    if (log.action === 'resubmit') return 'Request Resubmitted';
    if (log.action === 'status_change') return `Status Changed: ${log.oldStatus ?? 'N/A'} → ${log.newStatus}`;
    if (log.action === 'clarification_requested') return 'Clarification Requested';
    if (log.action === 'clarification_responded') return 'Clarification Response Submitted';
    if (log.action === 'reopen') return 'Request Reopened';
    if (log.action === 'update') return 'Request Updated';
    return 'Activity';
  };

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
          onClick={() => navigate('/myRequests')}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Requests
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/myRequests')}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Requests
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
            {request.status === 'clarification_needed' && (
              <button
                onClick={() => setShowClarificationModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                Respond to Clarification
              </button>
            )}
            {request.status === 'rejected' && (
              <button
                onClick={() => navigate(`/editRequest/${request.id}`)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Edit & Resubmit
              </button>
            )}
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
                Clarification Requested by Manager
              </h4>
              <p className="text-purple-800 dark:text-purple-400">
                {request.clarificationRequest}
              </p>
              {request.clarificationResponse && (
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-1">
                    Your Response:
                  </p>
                  <p className="text-purple-800 dark:text-purple-400">
                    {request.clarificationResponse}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Request Info Grid - Removed separate comments section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Submitted by:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {request.user?.name ?? 'Unknown'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {request.user?.email ?? 'Unknown'}
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
                <span className="text-gray-600 dark:text-gray-400">Assigned Manager:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {request.manager.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Logs/History - Comments shown here */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Request History & Activity
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
                      {/* Comments are shown directly in the timeline */}
                      {log.comments && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {log.comments}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clarification Response Modal */}
      {showClarificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Respond to Clarification
              </h3>
              <button
                onClick={() => setShowClarificationModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-300">
                <strong>Question:</strong> {request.clarificationRequest}
              </p>
            </div>
            <textarea
              value={clarificationResponse}
              onChange={(e) => setClarificationResponse(e.target.value)}
              placeholder="Type your response here..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowClarificationModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClarificationResponse}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail;