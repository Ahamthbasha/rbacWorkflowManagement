// pages/manager/requests/ManagerRequestDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import {
  getRequestById,
  approveRequest,
  rejectRequest,
  requestClarification
} from '../../../api/action/managerAction';
import type { WorkflowRequest, RequestLog, ManagerActionButtons, ActionButtons } from '../../../types/requestTypes';
import {
  BackButton,
  LoadingSpinner,
  NotFoundState,
  StatusBadge,
  PriorityBadge,
  ClarificationBlock,
  ReopenReasonBlock,
  RequestInfoGrid,
  RequestHistory,
  Modal,
} from '../../../components/common/RequestDetailCommon';
import { getRoleDisplayName } from '../../../utils/requestUtils';

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
      } else {
        toast.error(response.message || 'Failed to approve request');
      }
    } catch {
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
    } catch {
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

  // Type guard to check if actions are manager actions
  const isManagerActions = (actions: ActionButtons | undefined): actions is ManagerActionButtons => {
    return !!actions && ('canApprove' in actions || 'canReject' in actions || 'canClarify' in actions);
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return <NotFoundState onBack={() => navigate('/manager/requests')} backLabel="Back to Requests" />;

  const actions = request.actions && isManagerActions(request.actions) ? request.actions : null;
  const canTakeAction = actions && (actions.canApprove || actions.canReject || actions.canClarify);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <BackButton onClick={() => navigate('/manager/requests')} label="Back to Requests" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{request.title}</h1>
              <div className="flex flex-wrap gap-3 mt-3">
                {request.statusDisplay && <StatusBadge display={request.statusDisplay} />}
                {request.priorityDisplay && <PriorityBadge display={request.priorityDisplay} />}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {request.categoryLabel || request.category}
                </span>
              </div>
            </div>
            {canTakeAction && actions && (
              <div className="flex flex-wrap gap-2">
                {actions.canApprove && (
                  <button 
                    onClick={() => setShowApproveModal(true)} 
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" /> Approve
                  </button>
                )}
                {actions.canReject && (
                  <button 
                    onClick={() => setShowRejectModal(true)} 
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center transition-colors"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" /> Reject
                  </button>
                )}
                {actions.canClarify && (
                  <button 
                    onClick={() => setShowClarifyModal(true)} 
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center transition-colors"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" /> Ask Clarification
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{request.description}</p>
          </div>

          <ReopenReasonBlock request={request} />
          <ClarificationBlock request={request} />
          <RequestInfoGrid request={request} />

          {request.comments && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comments</h4>
              <p className="text-gray-600 dark:text-gray-400">{request.comments}</p>
            </div>
          )}
        </div>
      </div>

      <RequestHistory logs={request.logs || []} getDisplayNameWithRole={getDisplayNameWithRole} />

      {/* Approve Modal */}
      {showApproveModal && (
        <Modal 
          title="Approve Request" 
          onClose={() => setShowApproveModal(false)} 
          onConfirm={handleApprove}
          confirmLabel="Confirm Approve" 
          confirmClass="bg-green-600 hover:bg-green-700" 
          loading={actionLoading}
        >
          <textarea 
            value={approveComments} 
            onChange={e => setApproveComments(e.target.value)}
            placeholder="Optional: Add comments..." 
            rows={3}
            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal 
          title="Reject Request" 
          onClose={() => setShowRejectModal(false)} 
          onConfirm={handleReject}
          confirmLabel="Confirm Reject" 
          confirmClass="bg-red-600 hover:bg-red-700" 
          loading={actionLoading}
        >
          <textarea 
            value={rejectReason} 
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejection..." 
            rows={3} 
            required
            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </Modal>
      )}

      {/* Clarify Modal */}
      {showClarifyModal && (
        <Modal 
          title="Request Clarification" 
          onClose={() => setShowClarifyModal(false)} 
          onConfirm={handleClarify}
          confirmLabel="Send Question" 
          confirmClass="bg-purple-600 hover:bg-purple-700" 
          loading={actionLoading}
        >
          <textarea 
            value={clarifyQuestion} 
            onChange={e => setClarifyQuestion(e.target.value)}
            placeholder="Enter your question for the user..." 
            rows={3}
            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </Modal>
      )}
    </div>
  );
};

export default ManagerRequestDetail;