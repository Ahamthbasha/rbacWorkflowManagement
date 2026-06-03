import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getRequestById,
  closeRequest,
  reopenRequest,
} from "../../../api/action/adminAction";
import type {
  WorkflowRequest,
  RequestLog,
  AdminActionButtons,
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
import { formatDateInIST } from "../../../utils/timezoneUtils"; // ADD THIS

const isAdminActions = (
  actions: ActionButtons | undefined,
): actions is AdminActionButtons =>
  !!actions && ("canClose" in actions || "canReopen" in actions);

const AdminRequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [closureNote, setClosureNote] = useState("");
  const [reopenReason, setReopenReason] = useState("");

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    getRequestById(requestId)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setRequest(res.data);
          setLogs(res.data.logs ?? []);
        } else {
          toast.error("Failed to load request details.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load request details. Please try again.");
        }
      });

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
      } else {
        toast.error("Failed to load request details.");
      }
    } catch {
      toast.error("Failed to load request details. Please try again.");
    }
  };

  const handleClose = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      const res = await closeRequest(requestId, {
        closureNote: closureNote || undefined,
      });
      if (res.success) {
        toast.success("Request closed successfully.");
        setShowCloseModal(false);
        setClosureNote("");
        await refresh();
      } else {
        toast.error(res.message ?? "Failed to close request.");
      }
    } catch {
      toast.error("Failed to close request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async () => {
    if (!requestId) return;
    if (!reopenReason.trim()) {
      toast.error("Please provide a reason for reopening.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await reopenRequest(requestId, { reason: reopenReason });
      if (res.success) {
        toast.success("Request reopened successfully.");
        setShowReopenModal(false);
        setReopenReason("");
        await refresh();
      } else {
        toast.error(res.message ?? "Failed to reopen request.");
      }
    } catch {
      toast.error("Failed to reopen request.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!requestId || request === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading request…</p>
        </div>
      </div>
    );
  }

  const adminActions =
    request.actions && isAdminActions(request.actions) ? request.actions : null;
  const canClose = adminActions?.canClose ?? false;
  const canReopen = adminActions?.canReopen ?? false;
  const hasClarificationExchange =
    !!request.clarificationRequest || !!request.clarificationResponse;

  const headerActions = (
    <>
      {canClose && (
        <button
          onClick={() => setShowCloseModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-600 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.close} className="h-3.5 w-3.5" />
          Close Request
        </button>
      )}
      {canReopen && (
        <button
          onClick={() => setShowReopenModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.reopen} className="h-3.5 w-3.5" />
          Reopen Request
        </button>
      )}
    </>
  );

  const sidebarActions = (canClose || canReopen) && (
    <div className="flex flex-col gap-2">
      {canClose && (
        <button
          onClick={() => setShowCloseModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.close} className="h-4 w-4" />
          Close Request
        </button>
      )}
      {canReopen && (
        <button
          onClick={() => setShowReopenModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.reopen} className="h-4 w-4" />
          Reopen Request
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <RequestHeaderCard
        request={request}
        onBack={() => navigate("/admin/requests")}
        actions={headerActions}
      />

      {hasClarificationExchange && (
        <div className="rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 p-4 flex gap-3">
          <div className="mt-0.5 shrink-0">
            <Icon path={ICONS.clarify} className="h-4 w-4 text-violet-500" />
          </div>
          <div className="space-y-2 flex-1">
            <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">
              Clarification exchange
            </p>
            {request.clarificationRequest && (
              <div className="rounded-lg bg-white dark:bg-slate-800 border border-violet-100 dark:border-violet-800 px-3 py-2">
                <p className="text-xs text-violet-500 font-medium mb-0.5">
                  Manager&apos;s question
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {request.clarificationRequest}
                </p>
              </div>
            )}
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

      {request.reopenReason && (
        <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 p-4 flex gap-3">
          <div className="mt-0.5 shrink-0">
            <Icon path={ICONS.reopen} className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-0.5">
              Reopen reason
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {request.reopenReason}
            </p>
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
                      ? formatDateInIST(request.createdAt) // UPDATED
                      : "—")}
                </InfoField>
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
                {request.closedAtFormatted && (
                  <InfoField label="Closed at">
                    {request.closedAtFormatted}
                  </InfoField>
                )}
                {request.reopenedAtFormatted && (
                  <InfoField label="Reopened at">
                    {request.reopenedAtFormatted}
                  </InfoField>
                )}
              </div>

              {request.comments && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <InfoField label="Comments">
                    <span className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                      {request.comments}
                    </span>
                  </InfoField>
                </div>
              )}
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
          showManager={true}
          actionButtons={sidebarActions}
        />
      </div>

      {showCloseModal && (
        <ActionModal
          title="Close Request"
          confirmLabel="Confirm Close"
          confirmClass="bg-slate-600 hover:bg-slate-700"
          loading={actionLoading}
          onConfirm={handleClose}
          onClose={() => setShowCloseModal(false)}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Optionally add a closure note before closing.
          </p>
          <textarea
            value={closureNote}
            onChange={(e) => setClosureNote(e.target.value)}
            placeholder="Optional: Add closure notes"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none mb-4"
          />
        </ActionModal>
      )}

      {showReopenModal && (
        <ActionModal
          title="Reopen Request"
          confirmLabel="Confirm Reopen"
          confirmClass="bg-orange-600 hover:bg-orange-700"
          loading={actionLoading}
          onConfirm={handleReopen}
          onClose={() => setShowReopenModal(false)}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Please provide a reason for reopening this request.
          </p>
          <textarea
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Reason for reopening"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none mb-4"
          />
        </ActionModal>
      )}
    </div>
  );
};

export default AdminRequestDetail;