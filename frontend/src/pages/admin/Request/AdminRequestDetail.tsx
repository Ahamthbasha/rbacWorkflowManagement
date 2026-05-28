// pages/admin/Request/AdminRequestDetail.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, RefreshCw, XCircle, User } from 'lucide-react';
import {
  getRequestById,
  getRequestLogs,
  closeRequest,
  reopenRequest,
} from '../../../api/action/adminAction';
import type { WorkflowRequest, RequestLog, AdminActionButtons, ActionButtons } from '../../../types/requestTypes';
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
import { getRoleDisplayName, toSafeString } from '../../../utils/requestUtils';

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

  const getDisplayNameWithRole = (log: RequestLog): string => {
    const name = log.changedByUser?.name ?? 'System';
    const role = log.role;
    return `${name} (${getRoleDisplayName(role)})`;
  };

  // Type guard to check if actions are admin actions
  const isAdminActions = (actions: ActionButtons | undefined): actions is AdminActionButtons => {
    return !!actions && ('canClose' in actions || 'canReopen' in actions);
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return <NotFoundState onBack={() => navigate('/admin/requests')} backLabel="Back to Requests" />;

  const adminActions = request?.actions && isAdminActions(request.actions) ? request.actions : null;

  const additionalInfo = [
    ...(request.manager ? [{ icon: <User className="h-4 w-4 text-gray-400" />, label: "Manager", value: toSafeString(request.manager.name) }] : []),
    ...(request.approvedAtFormatted ? [{ icon: <CheckCircle className="h-4 w-4 text-gray-400" />, label: "Approved on", value: toSafeString(request.approvedAtFormatted) }] : []),
    ...(request.rejectedAtFormatted ? [{ icon: <XCircle className="h-4 w-4 text-gray-400" />, label: "Rejected on", value: toSafeString(request.rejectedAtFormatted) }] : []),
    ...(request.closedAtFormatted ? [{ icon: <CheckCircle className="h-4 w-4 text-gray-400" />, label: "Closed on", value: toSafeString(request.closedAtFormatted) }] : []),
    ...(request.reopenedAtFormatted ? [{ icon: <RefreshCw className="h-4 w-4 text-gray-400" />, label: "Reopened on", value: toSafeString(request.reopenedAtFormatted) }] : [])
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <BackButton onClick={() => navigate('/admin/requests')} label="Back to Requests" />

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

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{request.description}</p>
          </div>

          <ClarificationBlock request={request} />
          <RequestInfoGrid request={request} additionalInfo={additionalInfo} />

          {request.comments && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comments</h4>
              <p className="text-gray-600 dark:text-gray-400">{request.comments}</p>
            </div>
          )}

          <ReopenReasonBlock request={request} />
        </div>
      </div>

      <RequestHistory logs={logs} getDisplayNameWithRole={getDisplayNameWithRole} />

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
            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            required
            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </Modal>
      )}
    </div>
  );
};

export default AdminRequestDetail;