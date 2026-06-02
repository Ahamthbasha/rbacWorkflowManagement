import React, { useEffect, useState, useCallback } from "react";
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

// ─── helpers ──────────────────────────────────────────────────────────────────

const priorityColor = (p: string) => {
  const m: Record<string, "red" | "orange" | "yellow" | "blue" | "gray"> = {
    critical: "red",
    high: "orange",
    medium: "yellow",
    low: "blue",
    urgent: "red",
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
  approve:
    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  reject:
    "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  clarify:
    "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  info:
    "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  activity:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  user:
    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  check:
    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  tag:
    "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z",
  file:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  message:
    "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  hash:
    "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
  reply:
    "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
};

const actionIconPath = (iconName?: string): string => {
  const map: Record<string, string> = {
    FileText: ICONS.file,
    Tag: ICONS.tag,
    CheckCircle: ICONS.check,
    RefreshCw: ICONS.message,
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
  if (!value) {
    return (
      <span className="text-slate-400 italic text-xs">—</span>
    );
  }
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

// ─── action modal ─────────────────────────────────────────────────────────────

const ActionModal = ({
  title,
  confirmLabel,
  confirmClass,
  loading,
  onConfirm,
  onClose,
  children,
}: {
  title: string;
  confirmLabel: string;
  confirmClass: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon path={ICONS.cancel} className="h-4 w-4" />
          </button>
        </div>
        {children}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm disabled:opacity-60 ${confirmClass}`}
          >
            {loading && (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── request header card ──────────────────────────────────────────────────────

const RequestHeaderCard = ({
  request,
  onBack,
  onApprove,
  onReject,
  onClarify,
  canApprove,
  canReject,
  canClarify,
}: {
  request: WorkflowRequest;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  onClarify: () => void;
  canApprove: boolean;
  canReject: boolean;
  canClarify: boolean;
}) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
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
                  request.statusDisplay?.label ??
                  request.status ??
                  ""
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

        {/* right: manager actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {canApprove && (
            <button
              onClick={onApprove}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Icon
                path={ICONS.approve}
                className="h-3.5 w-3.5"
              />
              Approve
            </button>
          )}
          {canReject && (
            <button
              onClick={onReject}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
            >
              <Icon path={ICONS.reject} className="h-3.5 w-3.5" />
              Reject
            </button>
          )}
          {canClarify && (
            <button
              onClick={onClarify}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
            >
              <Icon
                path={ICONS.clarify}
                className="h-3.5 w-3.5"
              />
              Ask Clarification
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// ─── type guard ───────────────────────────────────────────────────────────────

const isManagerActions = (
  actions: ActionButtons | undefined
): actions is ManagerActionButtons =>
  !!actions &&
  "canApprove" in actions &&
  "canReject" in actions &&
  "canClarify" in actions;

// ─── page ─────────────────────────────────────────────────────────────────────

const ManagerRequestDetail: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<WorkflowRequest | null>(
    null
  );
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showClarifyModal, setShowClarifyModal] = useState(false);

  const [approveComments, setApproveComments] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [clarifyQuestion, setClarifyQuestion] = useState("");

  const fetchData = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getRequestById(requestId);
      if (res.success && res.data) {
        setRequest(res.data);
        setLogs(res.data.logs ?? []);
      } else {
        setError("Failed to load request details.");
      }
    } catch {
      setError("Failed to load request details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  // updated: keep effect body sync, delegate to inner async function
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
        await fetchData();
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
      const res = await rejectRequest(requestId, {
        reason: rejectReason,
      });
      if (res.success) {
        showSuccess("Request rejected.");
        setShowRejectModal(false);
        setRejectReason("");
        await fetchData();
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
        await fetchData();
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
          <p className="text-sm text-slate-500">
            Loading request…
          </p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Icon
            path={ICONS.file}
            className="h-7 w-7 text-slate-400"
          />
        </div>
        <p className="text-slate-500 font-medium">
          Request not found.
        </p>
        <button
          onClick={() => navigate("/manager/requests")}
          className="text-sm text-indigo-600 hover:underline font-medium"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  const actions = request.actions && isManagerActions(request.actions)
    ? request.actions
    : null;

  const canApprove = actions?.canApprove ?? false;
  const canReject = actions?.canReject ?? false;
  const canClarify = actions?.canClarify ?? false;
  const hasPendingClarification =
    request.status === "clarification_needed" &&
    !!request.clarificationRequest;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* toasts */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
          <Icon
            path={ICONS.cancel}
            className="h-4 w-4 text-red-500 shrink-0"
          />
          <p className="text-sm text-red-700 dark:text-red-300 flex-1">
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <Icon
              path={ICONS.cancel}
              className="h-3.5 w-3.5"
            />
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

      {/* header card */}
      <RequestHeaderCard
        request={request}
        onBack={() => navigate("/manager/requests")}
        onApprove={() => setShowApproveModal(true)}
        onReject={() => setShowRejectModal(true)}
        onClarify={() => setShowClarifyModal(true)}
        canApprove={canApprove}
        canReject={canReject}
        canClarify={canClarify}
      />

      {/* clarification exchange banner */}
      {hasPendingClarification && (
        <div className="rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 p-4 flex gap-3">
          <div className="mt-0.5 shrink-0">
            <Icon
              path={ICONS.clarify}
              className="h-4 w-4 text-violet-500"
            />
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

      {/* main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
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
                      request.priorityDisplay?.label ??
                      request.priority ??
                      ""
                    }
                    color={priorityColor(request.priority ?? "")}
                    apiColor={request.priorityDisplay?.color}
                  />
                </InfoField>
                <InfoField label="Submitted">
                  {request.submittedAtFormatted ??
                    (request.createdAt
                      ? new Date(
                          request.createdAt
                        ).toLocaleDateString()
                      : "—")}
                </InfoField>
                {request.updatedAt && (
                  <InfoField label="Last updated">
                    {new Date(
                      request.updatedAt
                    ).toLocaleString()}
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
          {/* status card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <Icon
                path={ICONS.check}
                className="h-6 w-6 text-slate-400"
              />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                Current Status
              </p>
              <StatusBadge
                label={
                  request.statusDisplay?.label ??
                  request.status ??
                  ""
                }
                color={statusColor(request.status ?? "")}
                apiColor={request.statusDisplay?.color}
                size="md"
              />
            </div>
          </div>

          {/* submitter info */}
          <SectionCard title="Submitted by">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                  <Icon
                    path={ICONS.user}
                    className="h-4 w-4 text-sky-600 dark:text-sky-400"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {request.user?.name ?? "Unknown user"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {request.user?.email ?? "No email"}
                  </p>
                </div>
              </div>
              {request.user?.department && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                    Department
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {request.user.department}
                  </span>
                </div>
              )}
            </div>
          </SectionCard>

          {/* quick details */}
          <SectionCard title="Details">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Category
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {request.categoryLabel ?? request.category}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Priority
                </span>
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
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Submitted
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {request.submittedAtFormatted ??
                    (request.createdAt
                      ? new Date(
                          request.createdAt
                        ).toLocaleDateString()
                      : "—")}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* actions sidebar */}
          {(canApprove || canReject || canClarify) && (
            <SectionCard title="Actions">
              <div className="flex flex-col gap-2">
                {canApprove && (
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Icon
                      path={ICONS.approve}
                      className="h-4 w-4"
                    />
                    Approve Request
                  </button>
                )}
                {canReject && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Icon
                      path={ICONS.reject}
                      className="h-4 w-4"
                    />
                    Reject Request
                  </button>
                )}
                {canClarify && (
                  <button
                    onClick={() => setShowClarifyModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
                  >
                    <Icon
                      path={ICONS.clarify}
                      className="h-4 w-4"
                    />
                    Ask Clarification
                  </button>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* Approve modal */}
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

      {/* Reject modal */}
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

      {/* Clarify modal */}
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
            Enter your question for the user. They will be notified to
            respond.
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