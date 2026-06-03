import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRequestById,
  respondToClarification,
} from "../../../api/action/userAction";
import type { WorkflowRequest, RequestLog } from "../../../types/requestTypes";
import ClarificationResponseForm from "../../../components/common/ClarificationResponseForm";
import StatusBadge from "../../../components/common/StatusBadge";
import InfoField from "../../../components/common/InfoField";
import SectionCard from "../../../components/common/SectionCard";
import { ICONS } from "../../../components/common/iconPaths";
import { Icon } from "../../../components/common/Icons";
import { ActivityTimeline } from "../../../components/common/ActivityTimeline";
import { RequestHeaderCard } from "../../../components/common/RequestHeaderCard";
import { RequestSidebar } from "../../../components/common/RequestSidebar";
import { priorityColor } from "../../../components/common/requestHelpers";
import { formatDateInIST } from "../../../utils/timezoneUtils";

const RequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(Boolean(requestId));
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<"view" | "clarify">("view");

  useEffect(() => {
    if (!requestId) return;

    let cancelled = false;

    const loadRequest = async () => {
      try {
        const res = await getRequestById(requestId);

        if (cancelled) return;

        if (res.success) {
          setRequest(res.data ?? null);
          setLogs(res.data?.logs ?? []);
          setError(null);
        } else {
          setError("Failed to load request details. Please try again.");
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

  const refreshRequest = async () => {
    if (!requestId) return;

    try {
      const res = await getRequestById(requestId);
      if (res.success) {
        setRequest(res.data ?? null);
        setLogs(res.data?.logs ?? []);
        setError(null);
      } else {
        setError("Failed to load request details. Please try again.");
      }
    } catch {
      setError("Failed to load request details. Please try again.");
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleClarificationSubmit = async (response: string) => {
    if (!requestId) return;

    setActionLoading(true);
    try {
      const res = await respondToClarification(requestId, { response });
      if (res.success) {
        setRequest(res.data ?? null);
        setPanelMode("view");
        showSuccess("Clarification submitted successfully.");
        await refreshRequest();
      } else {
        setError("Failed to submit clarification.");
      }
    } catch {
      setError("Failed to submit clarification.");
    } finally {
      setActionLoading(false);
    }
  };

  const status = request?.status;
  const canEdit = status === "rejected";
  const needsClarification = status === "clarification_needed";

  const lastClarificationLog = [...logs]
    .reverse()
    .find((l) => l.action === "clarification_requested");

  const rejectionLog = logs.find(
    (l) => l.action === "status_change" && l.newStatus === "rejected",
  );

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
          onClick={() => navigate(-1)}
          className="text-sm text-indigo-600 hover:underline font-medium"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const headerActions = (
    <>
      {needsClarification && panelMode !== "clarify" && (
        <button
          onClick={() => setPanelMode("clarify")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Icon path={ICONS.question} className="h-3.5 w-3.5" />
          Respond
        </button>
      )}

      {canEdit && (
        <button
          onClick={() => navigate(`/editRequest/${requestId}`)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.edit} className="h-3.5 w-3.5" />
          Edit & resubmit
        </button>
      )}
    </>
  );

  const sidebarActions = (needsClarification || canEdit) && (
    <div className="flex flex-col gap-2">
      {needsClarification && (
        <button
          onClick={() => setPanelMode("clarify")}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Icon path={ICONS.question} className="h-4 w-4" />
          Respond to clarification
        </button>
      )}

      {canEdit && (
        <button
          onClick={() => navigate(`/requests/${requestId}/edit`)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Icon path={ICONS.edit} className="h-4 w-4" />
          Edit & resubmit
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
        onBack={() => navigate(-1)}
        actions={headerActions}
      />

      {needsClarification && panelMode === "view" && (
        <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 p-4 flex gap-3">
          <div className="mt-0.5 shrink-0">
            <Icon path={ICONS.question} className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
              Clarification requested by your manager
            </p>
            {lastClarificationLog?.comments && (
              <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                {lastClarificationLog.comments}
              </p>
            )}
            <button
              onClick={() => setPanelMode("clarify")}
              className="mt-2 text-xs font-semibold text-orange-700 dark:text-orange-400 underline underline-offset-2 hover:no-underline"
            >
              Click here to respond →
            </button>
          </div>
        </div>
      )}

      {status === "rejected" && panelMode === "view" && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 flex gap-3">
          <div className="mt-0.5 shrink-0">
            <Icon path={ICONS.cancel} className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              This request was rejected
            </p>
            {rejectionLog?.comments && (
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {rejectionLog.comments}
              </p>
            )}
            <button
              onClick={() => navigate(`/editRequest/${requestId}`)}
              className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400 underline underline-offset-2 hover:no-underline"
            >
              Edit and resubmit →
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {panelMode === "clarify" && (
            <SectionCard
              title="Respond to clarification"
              icon={<Icon path={ICONS.question} className="h-4 w-4" />}
            >
              <ClarificationResponseForm
                managerQuestion={lastClarificationLog?.comments ?? undefined}
                onSubmit={handleClarificationSubmit}
                onCancel={() => setPanelMode("view")}
                loading={actionLoading}
              />
            </SectionCard>
          )}

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
                      ? formatDateInIST(request.createdAt)
                      : "—")}
                </InfoField>

                {request.updatedAt && (
                  <InfoField label="Last updated">
                    {formatDateInIST(request.updatedAt)}
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
    </div>
  );
};

export default RequestDetail;