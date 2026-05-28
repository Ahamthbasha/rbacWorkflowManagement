
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MessageSquare, FileText } from 'lucide-react';
import { getRequestById, respondToClarification } from '../../../api/action/userAction';
import type { WorkflowRequest, RequestLog } from '../../../types/requestTypes';
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
import { getRoleDisplayName,toSafeString } from '../../../utils/requestUtils';

const RequestDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationResponse, setClarificationResponse] = useState('');

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

  const refreshData = () => setRefreshKey((k) => k + 1);

  const handleClarificationResponse = async () => {
    if (!requestId) {
      toast.error('Invalid request id');
      return;
    }

    if (!clarificationResponse.trim()) {
      toast.error('Please enter your response');
      return;
    }

    setActionLoading(true);
    try {
      const response = await respondToClarification(requestId, {
        response: clarificationResponse.trim(),
      });

      if (response.success) {
        toast.success('Response submitted successfully');
        setShowClarificationModal(false);
        setClarificationResponse('');
        refreshData();
      } else {
        toast.error(response.message || 'Failed to submit response');
      }
    } catch {
      toast.error('Failed to submit response');
    } finally {
      setActionLoading(false);
    }
  };

  const getDisplayNameWithRole = (log: RequestLog): string => {
    const name = toSafeString(log.changedByUser?.name, 'System');
    const role = toSafeString(log.role, 'user');
    return `${name} (${getRoleDisplayName(role)})`;
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return <NotFoundState onBack={() => navigate('/myRequests')} backLabel="Back to My Requests" />;

  const canRespondToClarification = request.actions && 'canClarify' in request.actions && Boolean(request.actions.canClarify);
  const canEdit = request.actions && 'canEdit' in request.actions && Boolean(request.actions.canEdit);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <BackButton onClick={() => navigate('/myRequests')} label="Back to My Requests" />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{toSafeString(request.title)}</h1>
              <div className="flex flex-wrap gap-3 mt-3">
                {request.statusDisplay && <StatusBadge display={request.statusDisplay} />}
                {request.priorityDisplay && <PriorityBadge display={request.priorityDisplay} />}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {toSafeString(request.categoryLabel ?? request.category)}
                </span>
              </div>
            </div>

            {(canRespondToClarification || canEdit) && (
              <div className="flex flex-wrap gap-2">
                {canRespondToClarification && (
                  <button onClick={() => setShowClarificationModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Respond to Clarification
                  </button>
                )}
                {canEdit && (
                  <button onClick={() => navigate(`/editRequest/${request.id}`)} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Edit & Resubmit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{toSafeString(request.description)}</p>
          </div>

          <ReopenReasonBlock request={request} />
          <ClarificationBlock request={request} />
          <RequestInfoGrid request={request} />
        </div>
      </div>

      <RequestHistory logs={request.logs || []} getDisplayNameWithRole={getDisplayNameWithRole} />

      {showClarificationModal && (
        <Modal title="Respond to Clarification" onClose={() => setShowClarificationModal(false)} onConfirm={handleClarificationResponse}
          confirmLabel="Submit Response" confirmClass="bg-purple-600 hover:bg-purple-700" loading={actionLoading}>
          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-purple-800 dark:text-purple-300">
              <strong>Question:</strong> {toSafeString(request.clarificationRequest)}
            </p>
          </div>
          <textarea value={clarificationResponse} onChange={(e) => setClarificationResponse(e.target.value)}
            placeholder="Type your response here..." rows={4}
            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700" />
        </Modal>
      )}
    </div>
  );
};

export default RequestDetail;