import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRequestById,
  approveRequest,
  rejectRequest,
  requestClarification,
} from "../../../api/action/managerAction";
import type {
  WorkflowRequest,
  RequestLog,
  ManagerActionButtons,
  ActionButtons,
} from "../../../types/requestTypes";
import StatusBadge from "../../../components/common/StatusBadge";
import InfoField from "../../../components/common/InfoField";
import SectionCard from "../../../components/common/SectionCard";
import { ICONS } from "../../../components/common/iconPaths";
import { Icon } from "../../../components/common/Icons";
import { ActivityTimeline } from "../../../components/common/ActivityTimeline";
import { RequestHeaderCard } from "../../../components/common/RequestHeaderCard";
import { RequestSidebar } from "../../../components/common/RequestSidebar";
import { ActionModal } from "../../../components/common/ActionModal";
import { priorityColor } from "../../../components/common/requestHelpers";

const isManagerActions = (
  actions: ActionButtons | undefined,
): actions is ManagerActionButtons =>
  !!actions &&
  "canApprove" in actions &&
  "canReject" in actions &&
  "canClarify" in actions;

const ManagerRequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(Boolean(requestId));
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showClarifyModal, setShowClarifyModal] = useState(false);

  const [approveComments, setApproveComments] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [clarifyQuestion, setClarifyQuestion] = useState("");

  useEffect(() => {
    if (!requestId) return;

    let cancelled = false;

    const loadRequest = async () => {
      try {
        const res = await getRequestById(requestId);

        if (cancelled) return;

        if (res.success && res.data) {
          setRequest(res.data);
          setLogs(res.data.logs ?? []);
          setError(null);
        } else {
          setError("Failed to load request details.");
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load request details. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRequest();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const refresh = async () => {
    if (!requestId) return;

    try {
      const res = await getRequestById(requestId);
      if (res.success && res.data) {
        setRequest(res.data);
        setLogs(res.data.logs ?? []);
        setError(null);
      } else {
        setError("Failed to load request details.");
      }
    } catch {
      setError("Failed to load request details. Please try again.");
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleApprove = async () => {
    if (!requestId) return;

    setActionLoading(true);
    try {
      const res = await approveRequest(requestId, {
        comments: approveComments || undefined,
      });

      if (res.success) {
        showSuccess("Request approved successfully.");
        setShowApproveModal(false);
        setApproveComments("");
        await refresh();
      } else {
        setError(res.message ?? "Failed to approve request.");
      }
    } catch {
      setError("Failed to approve request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!requestId) return;

    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await rejectRequest(requestId, { reason: rejectReason });

      if (res.success) {
        showSuccess("Request rejected.");
        setShowRejectModal(false);
        setRejectReason("");
        await refresh();
      } else {
        setError(res.message ?? "Failed to reject request.");
      }
    } catch {
      setError("Failed to reject request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClarify = async () => {
    if (!requestId) return;

    if (!clarifyQuestion.trim()) {
      setError("Please enter your question.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await requestClarification(requestId, {
        question: clarifyQuestion,
      });

      if (res.success) {
        showSuccess("Clarification requested successfully.");
        setShowClarifyModal(false);
        setClarifyQuestion("");
        await refresh();
      } else {
        setError(res.message ?? "Failed to request clarification.");
      }
    } catch {
      setError("Failed to request clarification.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading request…</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Icon path={ICONS.file} className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">Request not found.</p>
        <button
          onClick={() => navigate("/manager/requests")}
          className="text-sm text-indigo-600 hover:underline font-medium"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const actions =
    request.actions && isManagerActions(request.actions)
      ? request.actions
      : null;

  const canApprove = actions?.canApprove ?? false;
  const canReject = actions?.canReject ?? false;
  const canClarify = actions?.canClarify ?? false;

  const hasPendingClarification =
    request.status === "clarification_needed" && !!request.clarificationRequest;

  const headerActions = (
    <>
      {canApprove && (
        <button
          onClick={() => setShowApproveModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.approve} className="h-3.5 w-3.5" />
          Approve
        </button>
      )}

      {canReject && (
        <button
          onClick={() => setShowRejectModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.reject} className="h-3.5 w-3.5" />
          Reject
        </button>
      )}

      {canClarify && (
        <button
          onClick={() => setShowClarifyModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.clarify} className="h-3.5 w-3.5" />
          Ask Clarification
        </button>
      )}
    </>
  );

  const sidebarActions = (canApprove || canReject || canClarify) && (
    <div className="flex flex-col gap-2">
      {canApprove && (
        <button
          onClick={() => setShowApproveModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.approve} className="h-4 w-4" />
          Approve Request
        </button>
      )}

      {canReject && (
        <button
          onClick={() => setShowRejectModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.reject} className="h-4 w-4" />
          Reject Request
        </button>
      )}

      {canClarify && (
        <button
          onClick={() => setShowClarifyModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.clarify} className="h-4 w-4" />
          Ask Clarification
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
          <Icon path={ICONS.cancel} className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300 flex-1">
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <Icon path={ICONS.cancel} className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
          <Icon
            path={ICONS.check}
            className="h-4 w-4 text-emerald-500 shrink-0"
          />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {successMsg}
          </p>
        </div>
      )}

      <RequestHeaderCard
        request={request}
        onBack={() => navigate("/manager/requests")}
        actions={headerActions}
      />

      {hasPendingClarification && (
        <div className="rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 p-4 flex gap-3">
          <div className="mt-0.5 shrink-0">
            <Icon path={ICONS.clarify} className="h-4 w-4 text-violet-500" />
          </div>

          <div className="space-y-2 flex-1">
            <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">
              Awaiting clarification from user
            </p>

            <div className="rounded-lg bg-white dark:bg-slate-800 border border-violet-100 dark:border-violet-800 px-3 py-2">
              <p className="text-xs text-violet-500 font-medium mb-0.5">
                Your question
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {request.clarificationRequest}
              </p>
            </div>

            {request.clarificationResponse && (
              <div className="rounded-lg bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 px-3 py-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon
                    path={ICONS.reply}
                    className="h-3 w-3 text-violet-400"
                  />
                  <p className="text-xs text-violet-500 font-medium">
                    User&apos;s response
                  </p>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {request.clarificationResponse}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <SectionCard
            title="Request details"
            icon={<Icon path={ICONS.info} className="h-4 w-4" />}
          >
            <div className="space-y-5">
              <InfoField label="Description">
                <span className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                  {request.description}
                </span>
              </InfoField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <InfoField label="Category">
                  {request.categoryLabel ?? request.category}
                </InfoField>

                <InfoField label="Priority">
                  <StatusBadge
                    label={
                      request.priorityDisplay?.label ?? request.priority ?? ""
                    }
                    color={priorityColor(request.priority ?? "")}
                    apiColor={request.priorityDisplay?.color}
                  />
                </InfoField>

                <InfoField label="Submitted">
                  {request.submittedAtFormatted ??
                    (request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString()
                      : "—")}
                </InfoField>

                {request.updatedAt && (
                  <InfoField label="Last updated">
                    {new Date(request.updatedAt).toLocaleString()}
                  </InfoField>
                )}

                {request.approvedAtFormatted && (
                  <InfoField label="Approved at">
                    {request.approvedAtFormatted}
                  </InfoField>
                )}

                {request.rejectedAtFormatted && (
                  <InfoField label="Rejected at">
                    {request.rejectedAtFormatted}
                  </InfoField>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Activity log"
            icon={<Icon path={ICONS.activity} className="h-4 w-4" />}
          >
            <ActivityTimeline logs={logs} />
          </SectionCard>
        </div>

        <RequestSidebar
          request={request}
          showSubmitter={true}
          actionButtons={sidebarActions}
        />
      </div>

      {showApproveModal && (
        <ActionModal
          title="Approve Request"
          confirmLabel="Confirm Approve"
          confirmClass="bg-emerald-600 hover:bg-emerald-700"
          loading={actionLoading}
          onConfirm={handleApprove}
          onClose={() => setShowApproveModal(false)}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Optionally add a comment before approving.
          </p>
          <textarea
            value={approveComments}
            onChange={(e) => setApproveComments(e.target.value)}
            placeholder="Optional: Add comments"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-4"
          />
        </ActionModal>
      )}

      {showRejectModal && (
        <ActionModal
          title="Reject Request"
          confirmLabel="Confirm Reject"
          confirmClass="bg-red-600 hover:bg-red-700"
          loading={actionLoading}
          onConfirm={handleReject}
          onClose={() => setShowRejectModal(false)}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Please provide a reason for rejection.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
          />
        </ActionModal>
      )}

      {showClarifyModal && (
        <ActionModal
          title="Ask for Clarification"
          confirmLabel="Send Question"
          confirmClass="bg-violet-600 hover:bg-violet-700"
          loading={actionLoading}
          onConfirm={handleClarify}
          onClose={() => setShowClarifyModal(false)}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Enter your question for the user. They will be notified to respond.
          </p>
          <textarea
            value={clarifyQuestion}
            onChange={(e) => setClarifyQuestion(e.target.value)}
            placeholder="What would you like the user to clarify?"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none mb-4"
          />
        </ActionModal>
      )}
    </div>
  );
};

export default ManagerRequestDetail;
