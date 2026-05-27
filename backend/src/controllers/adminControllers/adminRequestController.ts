// controllers/adminControllers/adminRequestController.ts
import { Response, NextFunction } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../../middlewares/authMiddleware";
import RequestModel, {
  RequestStatus,
  RequestPriority,
  RequestCategory,
} from "../../models/requestModel";
import RequestLogModel, { ActionType } from "../../models/requestLogModel";
import User from "../../models/userModel";
import AppError from "../../utils/appError";

const Request = RequestModel;
const RequestLog = RequestLogModel;

// ─── Date Formatting ─────────────────────────────────────────────────────────

const formatIndianDate = (date: Date | string | null): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ─── Status Config (badge info for frontend) ─────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; iconName: string }
> = {
  submitted: { label: "Submitted", color: "yellow", iconName: "Clock" },
  pending: { label: "Pending", color: "blue", iconName: "Clock" },
  approved: { label: "Approved", color: "green", iconName: "CheckCircle" },
  rejected: { label: "Rejected", color: "red", iconName: "XCircle" },
  clarification_needed: {
    label: "Clarification Needed",
    color: "purple",
    iconName: "AlertCircle",
  },
  closed: { label: "Closed", color: "gray", iconName: "CheckCircle" },
  reopened: { label: "Reopened", color: "teal", iconName: "RefreshCw" },
  cancelled: { label: "Cancelled", color: "orange", iconName: "XCircle" },
};

// ─── Priority Config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "green" },
  medium: { label: "Medium", color: "yellow" },
  high: { label: "High", color: "orange" },
  urgent: { label: "Urgent", color: "red" },
};

// ─── Category Labels ──────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  access: "Access Request",
  software: "Software Request",
  hardware: "Hardware Request",
  leave: "Leave Request",
  budget: "Budget Request",
  other: "Other",
};

// ─── Action Labels ────────────────────────────────────────────────────────────

const getActionLabel = (
  action: string,
  oldStatus: string | null,
  newStatus: string | null,
): string => {
  switch (action) {
    case "create":
      return "Request Created";
    case "edit":
      return "Request Edited";
    case "resubmit":
      return "Request Resubmitted";
    case "status_change":
      return `Status Changed: ${oldStatus ?? "N/A"} → ${newStatus ?? "N/A"}`;
    case "clarification_requested":
      return "Clarification Requested";
    case "clarification_responded":
      return "Clarification Response Submitted";
    case "reopen":
      return "Request Reopened";
    default:
      return "Activity";
  }
};

const ACTION_ICON_MAP: Record<string, string> = {
  create: "FileText",
  edit: "Edit",
  resubmit: "RefreshCw",
  status_change: "Tag",
  clarification_requested: "MessageSquare",
  clarification_responded: "Send",
  reopen: "RefreshCw",
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatLog = (log: any) => {
  const p = log.toJSON ? log.toJSON() : log;
  return {
    id: p.id,
    requestId: p.requestId,
    oldStatus: p.oldStatus,
    newStatus: p.newStatus,
    role: p.role,
    action: p.action,
    actionLabel: getActionLabel(p.action, p.oldStatus, p.newStatus),
    actionIconName: ACTION_ICON_MAP[p.action] ?? "History",
    comments: p.comments,
    timestampFormatted: formatIndianDate(p.timestamp),
    changedByUser: p.changedByUser
      ? {
          id: p.changedByUser.id,
          name: p.changedByUser.name,
          email: p.changedByUser.email,
          role:p.role,
        }
      : null,
  };
};

const formatRequest = (request: any, includeLogs = false) => {
  const p = request.toJSON ? request.toJSON() : request;

  const statusConfig = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.submitted;
  const priorityConfig = PRIORITY_CONFIG[p.priority] ?? PRIORITY_CONFIG.medium;

  const result: Record<string, any> = {
    id: p.id,
    title: p.title,
    description: p.description,

    // Raw enums (still useful for conditional logic on frontend if ever needed)
    category: p.category,
    priority: p.priority,
    status: p.status,

    // ── Computed display values (frontend renders directly) ──
    categoryLabel: CATEGORY_LABELS[p.category] ?? p.category,

    statusDisplay: {
      label: statusConfig.label,
      color: statusConfig.color,
      iconName: statusConfig.iconName,
    },

    priorityDisplay: {
      label: priorityConfig.label,
      color: priorityConfig.color,
    },

    // ── Timestamps ──
    submittedAtFormatted: formatIndianDate(p.submittedAt),
    createdAtFormatted: formatIndianDate(p.createdAt),
    approvedAtFormatted: p.approvedAt ? formatIndianDate(p.approvedAt) : null,
    rejectedAtFormatted: p.rejectedAt ? formatIndianDate(p.rejectedAt) : null,
    closedAtFormatted: p.closedAt ? formatIndianDate(p.closedAt) : null,
    reopenedAtFormatted: p.reopenedAt ? formatIndianDate(p.reopenedAt) : null,

    // ── Content fields ──
    comments: p.comments,
    clarificationRequest: p.clarificationRequest,
    clarificationResponse: p.clarificationResponse,
    reopenReason: p.reopenReason,

    // ── Relations ──
    user: p.user
      ? {
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          department: p.user.department,
        }
      : null,
    manager: p.manager
      ? { id: p.manager.id, name: p.manager.name, email: p.manager.email }
      : null,
    admin: p.admin
      ? { id: p.admin.id, name: p.admin.name, email: p.admin.email }
      : null,

    // ── Permission flags (backend decides, frontend just reads) ──
    actions: {
      canClose: p.status === RequestStatus.APPROVED,
      canReopen:
        p.status === RequestStatus.CLOSED ||
        p.status === RequestStatus.CANCELLED,
    },
  };

  if (includeLogs && p.logs) {
    result.logs = p.logs.map(formatLog);
  }

  return result;
};

// ─── Controller ───────────────────────────────────────────────────────────────

export class AdminRequestController {
  // GET /admin/requests
  getAllRequests = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "admin")
        throw new AppError("Access denied. Admin privileges required.", 403);

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = (page - 1) * limit;

      const { status, category, priority, startDate, endDate, search } =
        req.query as Record<string, string>;

      const where: any = {};
      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Request.findAndCountAll({
        where,
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        attributes: [
          "id",
          "title",
          "description",
          "category",
          "priority",
          "status",
          "submittedAt",
          "createdAt",
        ],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "department"],
          },
          { model: User, as: "manager", attributes: ["id", "name", "email"] },
        ],
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        data: rows.map((r) => formatRequest(r)),
        pagination: {
          total: count,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /admin/requests/:requestId
  getRequestById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "admin")
        throw new AppError("Access denied. Admin privileges required.", 403);

      const request = await Request.findByPk(req.params.requestId, {
        attributes: [
          "id",
          "title",
          "description",
          "category",
          "priority",
          "status",
          "comments",
          "clarificationRequest",
          "clarificationResponse",
          "reopenReason",
          "submittedAt",
          "createdAt",
          "approvedAt",
          "rejectedAt",
          "closedAt",
          "reopenedAt",
        ],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "department"],
          },
          { model: User, as: "manager", attributes: ["id", "name", "email"] },
          { model: User, as: "admin", attributes: ["id", "name", "email"] },
          {
            model: RequestLog,
            as: "logs",
            order: [["timestamp", "ASC"]],
            attributes: [
              "id",
              "requestId",
              "oldStatus",
              "newStatus",
              "role",
              "action",
              "comments",
              "timestamp",
            ],
            include: [
              {
                model: User,
                as: "changedByUser",
                attributes: ["id", "name", "email"],
              },
            ],
          },
        ],
      });

      if (!request) throw new AppError("Request not found", 404);

      res.status(200).json({
        success: true,
        data: formatRequest(request, true),
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /admin/requests/:requestId/close
  closeRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "admin")
        throw new AppError("Access denied. Admin privileges required.", 403);

      const { requestId } = req.params;
      const { closureNote } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError("Request not found", 404);
      if (request.status !== RequestStatus.APPROVED) {
        throw new AppError("Only approved requests can be closed", 400);
      }

      const oldStatus = request.status;
      request.status = RequestStatus.CLOSED;
      request.comments = closureNote || request.comments;
      request.closedAt = new Date();
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.CLOSED,
        changedBy: userId!,
        role: userRole,
        action: ActionType.STATUS_CHANGE,
        comments: closureNote || `Request closed by ${userRole}`,
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Request closed successfully",
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /admin/requests/:requestId/reopen
  reopenRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "admin")
        throw new AppError("Access denied. Admin privileges required.", 403);

      const { requestId } = req.params;
      const { reason } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!reason?.trim()) throw new AppError("Reopen reason is required", 400);

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError("Request not found", 404);
      if (
        request.status !== RequestStatus.CLOSED &&
        request.status !== RequestStatus.CANCELLED
      ) {
        throw new AppError(
          "Only closed or cancelled requests can be reopened",
          400,
        );
      }

      const oldStatus = request.status;
      request.status = RequestStatus.PENDING;
      request.reopenReason = reason;
      request.reopenedAt = new Date();
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.PENDING,
        changedBy: userId!,
        role: userRole,
        action: ActionType.REOPEN,
        comments: `Admin reopened request for further review: ${reason}`,
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message:
          "Request reopened successfully. It is now pending manager review.",
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /admin/requests/:requestId/logs
  getRequestLogs = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "admin")
        throw new AppError("Access denied. Admin privileges required.", 403);

      const logs = await RequestLog.findAll({
        where: { requestId: req.params.requestId },
        attributes: [
          "id",
          "requestId",
          "oldStatus",
          "newStatus",
          "role",
          "action",
          "comments",
          "timestamp",
        ],
        include: [
          {
            model: User,
            as: "changedByUser",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["timestamp", "ASC"]],
      });

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs.map(formatLog),
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /admin/dashboard
  getDashboardStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "admin")
        throw new AppError("Access denied. Admin privileges required.", 403);

      const [
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        closedRequests,
        cancelledRequests,
        recentRequests,
      ] = await Promise.all([
        Request.count(),
        Request.count({
          where: {
            status: {
              [Op.in]: [
                RequestStatus.SUBMITTED,
                RequestStatus.PENDING,
                RequestStatus.CLARIFICATION,
              ],
            },
          },
        }),
        Request.count({ where: { status: RequestStatus.APPROVED } }),
        Request.count({ where: { status: RequestStatus.REJECTED } }),
        Request.count({ where: { status: RequestStatus.CLOSED } }),
        Request.count({ where: { status: RequestStatus.CANCELLED } }),
        Request.findAll({
          limit: 5,
          order: [["createdAt", "DESC"]],
          attributes: [
            "id",
            "title",
            "category",
            "priority",
            "status",
            "submittedAt",
          ],
          include: [{ model: User, as: "user", attributes: ["name"] }],
        }),
      ]);

      const formattedRecent = recentRequests.map((r: any) => {
        const p = r.toJSON();
        return {
          id: p.id,
          title: p.title,

          categoryLabel: CATEGORY_LABELS[p.category] ?? p.category,
          statusDisplay: STATUS_CONFIG[p.status] ?? STATUS_CONFIG.submitted,
          priorityDisplay:
            PRIORITY_CONFIG[p.priority] ?? PRIORITY_CONFIG.medium,

          // Raw values kept for any future client-side filtering
          category: p.category,
          priority: p.priority,
          status: p.status,

          user: p.user ? { name: p.user.name } : null,
          submittedAtFormatted: formatIndianDate(p.submittedAt),
        };
      });

      // Percentage breakdowns (useful for charts / progress bars)
      const safeTotal = totalRequests || 1;
      const breakdown = {
        pendingPct: +((pendingRequests / safeTotal) * 100).toFixed(1),
        approvedPct: +((approvedRequests / safeTotal) * 100).toFixed(1),
        rejectedPct: +((rejectedRequests / safeTotal) * 100).toFixed(1),
        closedPct: +((closedRequests / safeTotal) * 100).toFixed(1),
        cancelledPct: +((cancelledRequests / safeTotal) * 100).toFixed(1),
      };

      res.status(200).json({
        success: true,
        data: {
          counts: {
            total: totalRequests,
            pending: pendingRequests,
            approved: approvedRequests,
            rejected: rejectedRequests,
            closed: closedRequests,
            cancelled: cancelledRequests,
          },
          breakdown,
          recentRequests: formattedRecent,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminRequestController;
