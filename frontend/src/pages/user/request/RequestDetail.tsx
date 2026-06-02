import React, { useEffect, useState, useCallback } from "react";
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

// ─── helpers ──────────────────────────────────────────────────────────────────

const priorityColor = (p: string) => {
  const m: Record<string, "red" | "orange" | "yellow" | "blue" | "gray"> = {
    critical: "red",
    high: "orange",
    medium: "yellow",
    low: "blue",
  };
  return m[p] ?? "gray";
};

const statusColor = (s: string) => {
  const m: Record<
    string,
    "blue" | "yellow" | "green" | "red" | "orange" | "purple" | "gray"
  > = {
    submitted: "blue",
    pending: "yellow",
    approved: "green",
    rejected: "red",
    clarification_needed: "orange",
    closed: "gray",
    cancelled: "gray",
    reopened: "purple",
  };
  return m[s] ?? "gray";
};

// ─── icons ────────────────────────────────────────────────────────────────────

const Icon = ({
  path,
  className = "h-4 w-4",
}: {
  path: string;
  className?: string;
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  back: "M10 19l-7-7m0 0l7-7m-7 7h18",
  cancel: "M6 18L18 6M6 6l12 12",
  edit:
    "M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14H8v-2a2 2 0 01.586-1.414z",
  info:
    "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  activity:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  question:
    "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  user:
    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  check:
    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  tag:
    "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z",
  file:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  refresh:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  message:
    "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  hash:
    "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
};

const actionIconPath = (iconName?: string): string => {
  const map: Record<string, string> = {
    FileText: ICONS.file,
    Tag: ICONS.tag,
    CheckCircle: ICONS.check,
    RefreshCw: ICONS.refresh,
    MessageCircle: ICONS.message,
    User: ICONS.user,
  };
  return map[iconName ?? ""] ?? ICONS.tag;
};

// ─── role badge ───────────────────────────────────────────────────────────────

const roleBadgeClass = (role: string) => {
  const m: Record<string, string> = {
    user:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    manager:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    admin:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  };
  return (
    m[role] ??
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
  );
};

// ─── status pill ──────────────────────────────────────────────────────────────

const StatusPill = ({ value }: { value: string | null }) => {
  if (!value)
    return (
      <span className="text-slate-400 italic text-xs">—</span>
    );
  const color = statusColor(value);
  const colorMap: Record<string, string> = {
    blue:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    yellow:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    green:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    red:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    purple:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    gray:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorMap[color]}`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
};

// ─── activity timeline ────────────────────────────────────────────────────────

const ActivityTimeline = ({ logs }: { logs: RequestLog[] }) => {
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Icon
            path={ICONS.activity}
            className="h-5 w-5 text-slate-400"
          />
        </div>
        <p className="text-sm text-slate-400">No activity yet.</p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {logs.map((log, idx) => {
        const isLast = idx === logs.length - 1;
        const actor = log.changedByUser as
          | { id: string; name: string; email: string; role?: string }
          | undefined;

        return (
          <li key={log.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900">
                <Icon
                  path={actionIconPath(log.actionIconName)}
                  className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400"
                />
              </span>
              {!isLast && (
                <span className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />
              )}
            </div>

            <div
              className={`flex-1 min-w-0 ${
                isLast ? "pb-0" : "pb-5"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {log.actionLabel ?? log.action}
                </span>
                {actor?.role && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleBadgeClass(
                      actor.role
                    )}`}
                  >
                    {actor.role}
                  </span>
                )}
                <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">
                  {log.timestampFormatted ?? log.timestamp}
                </span>
              </div>

              {actor && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Icon path={ICONS.user} className="h-3 w-3" />
                  <span>{actor.name}</span>
                  <span className="text-slate-300 dark:text-slate-600">
                    ·
                  </span>
                  <span className="truncate">{actor.email}</span>
                </div>
              )}

              {(log.oldStatus || log.newStatus) && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <StatusPill value={log.oldStatus ?? null} />
                  {log.oldStatus && log.newStatus && (
                    <Icon
                      path="M9 5l7 7-7 7"
                      className="h-3 w-3 text-slate-400 shrink-0"
                    />
                  )}
                  <StatusPill value={log.newStatus ?? null} />
                </div>
              )}

              {log.comments && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700">
                  {log.comments}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

// ─── request header card ──────────────────────────────────────────────────────

const RequestHeaderCard = ({
  request,
  onBack,
  onEdit,
  onClarify,
  panelMode,
  canEdit,
  needsClarification,
}: {
  request: WorkflowRequest;
  onBack: () => void;
  onEdit: () => void;
  onClarify: () => void;
  panelMode: string;
  canEdit: boolean;
  needsClarification: boolean;
}) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
    {/* top accent strip */}
    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

    <div className="px-6 py-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* left: back + title */}
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={onBack}
            className="mt-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            aria-label="Go back"
          >
            <Icon path={ICONS.back} className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                {request.title}
              </h1>
              <StatusBadge
                label={
                  request.statusDisplay?.label ?? request.status ?? ""
                }
                color={statusColor(request.status ?? "")}
                apiColor={request.statusDisplay?.color}
              />
            </div>
            <div className="mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Icon path={ICONS.hash} className="h-3 w-3" />
                <span className="font-mono">{request.id}</span>
              </span>
              {request.categoryLabel && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Icon path={ICONS.tag} className="h-3 w-3" />
                  {request.categoryLabel}
                </span>
              )}
              {(request.submittedAtFormatted ?? request.createdAt) && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Icon path={ICONS.calendar} className="h-3 w-3" />
                  {request.submittedAtFormatted ??
                    new Date(
                      request.createdAt!
                    ).toLocaleDateString()}
                </span>
              )}
              <StatusBadge
                label={
                  request.priorityDisplay?.label ??
                  request.priority ??
                  ""
                }
                color={priorityColor(request.priority ?? "")}
                apiColor={request.priorityDisplay?.color}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* right: action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {needsClarification && panelMode !== "clarify" && (
            <button
              onClick={onClarify}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Icon
                path={ICONS.question}
                className="h-3.5 w-3.5"
              />
              Respond
            </button>
          )}
          {canEdit && panelMode !== "edit" && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Icon path={ICONS.edit} className="h-3.5 w-3.5" />
              Edit & resubmit
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// ─── page ─────────────────────────────────────────────────────────────────────

type PanelMode = "view" | "clarify";

const RequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<WorkflowRequest | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("view");

  // data loading
  const fetchData = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getRequestById(requestId);
      if (res.success) {
        setRequest(res.data ?? null);
        setLogs(res.data?.logs ?? []);
      }
    } catch {
      setError("Failed to load request details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    const run = () => {
      void fetchData();
    };
    run();
  }, [fetchData]);

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
        await fetchData();
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
    (l) => l.action === "status_change" && l.newStatus === "rejected"
  );

  // ── loading ──
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* toasts */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
          <Icon path={ICONS.cancel} className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <Icon path={ICONS.cancel} className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
          <Icon path={ICONS.check} className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMsg}</p>
        </div>
      )}

      {/* header card */}
      <RequestHeaderCard
        request={request}
        onBack={() => navigate(-1)}
        onEdit={() => navigate(`/editRequest/${requestId}`)}
        onClarify={() => setPanelMode("clarify")}
        panelMode={panelMode}
        canEdit={canEdit}
        needsClarification={needsClarification}
      />

      {/* alert banners */}
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

      {/* main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* clarify panel */}
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

          {/* request details */}
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
              </div>
            </div>
          </SectionCard>

          {/* activity log */}
          <SectionCard
            title="Activity log"
            icon={<Icon path={ICONS.activity} className="h-4 w-4" />}
          >
            <ActivityTimeline logs={logs} />
          </SectionCard>
        </div>

        {/* sidebar */}
        <div className="space-y-4">
          {(needsClarification || canEdit) && (
            <SectionCard title="Actions">
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
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;