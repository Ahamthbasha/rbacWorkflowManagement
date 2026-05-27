// controllers/managerControllers/managerRequestController.ts
import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../../middlewares/authMiddleware';
import RequestModel, { RequestStatus, RequestPriority, RequestCategory } from '../../models/requestModel';
import RequestLogModel, { ActionType } from '../../models/requestLogModel';
import User from '../../models/userModel';
import AppError from '../../utils/appError';

const Request = RequestModel;
const RequestLog = RequestLogModel;

// ─── Date Formatting ─────────────────────────────────────────────────────────
const formatIndianDate = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// ─── Status Config (badge info for frontend) ─────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; iconName: string }> = {
  submitted: { label: 'Submitted', color: 'yellow', iconName: 'Clock' },
  pending: { label: 'Pending', color: 'blue', iconName: 'Clock' },
  approved: { label: 'Approved', color: 'green', iconName: 'CheckCircle' },
  rejected: { label: 'Rejected', color: 'red', iconName: 'XCircle' },
  clarification_needed: { label: 'Clarification Needed', color: 'purple', iconName: 'AlertCircle' },
  closed: { label: 'Closed', color: 'gray', iconName: 'CheckCircle' },
  reopened: { label: 'Reopened', color: 'teal', iconName: 'RefreshCw' },
  cancelled: { label: 'Cancelled', color: 'orange', iconName: 'XCircle' },
};

// ─── Priority Config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'green' },
  medium: { label: 'Medium', color: 'yellow' },
  high: { label: 'High', color: 'orange' },
  urgent: { label: 'Urgent', color: 'red' },
};

// ─── Category Labels ──────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  access: 'Access Request',
  software: 'Software Request',
  hardware: 'Hardware Request',
  leave: 'Leave Request',
  budget: 'Budget Request',
  other: 'Other',
};

// ─── Action Labels ────────────────────────────────────────────────────────────
const getActionLabel = (action: string, oldStatus: string | null, newStatus: string | null): string => {
  switch (action) {
    case 'create': return 'Request Created';
    case 'edit': return 'Request Edited';
    case 'resubmit': return 'Request Resubmitted';
    case 'status_change': return `Status Changed: ${oldStatus ?? 'N/A'} → ${newStatus ?? 'N/A'}`;
    case 'clarification_requested': return 'Clarification Requested';
    case 'clarification_responded': return 'Clarification Response Submitted';
    case 'reopen': return 'Request Reopened by Admin';
    default: return 'Activity';
  }
};

const ACTION_ICON_MAP: Record<string, string> = {
  create: 'FileText',
  edit: 'Edit',
  resubmit: 'RefreshCw',
  status_change: 'Tag',
  clarification_requested: 'MessageSquare',
  clarification_responded: 'Send',
  reopen: 'RefreshCw',
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
    actionIconName: ACTION_ICON_MAP[p.action] ?? 'History',
    comments: p.comments,
    timestampFormatted: formatIndianDate(p.timestamp),
    changedByUser: p.changedByUser
      ? {
          id: p.changedByUser.id,
          name: p.changedByUser.name,
          email: p.changedByUser.email,
          role: p.role,
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

    category: p.category,
    priority: p.priority,
    status: p.status,

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

    submittedAtFormatted: formatIndianDate(p.submittedAt),
    createdAtFormatted: formatIndianDate(p.createdAt),
    approvedAtFormatted: p.approvedAt ? formatIndianDate(p.approvedAt) : null,
    rejectedAtFormatted: p.rejectedAt ? formatIndianDate(p.rejectedAt) : null,
    closedAtFormatted: p.closedAt ? formatIndianDate(p.closedAt) : null,
    reopenedAtFormatted: p.reopenedAt ? formatIndianDate(p.reopenedAt) : null,

    comments: p.comments,
    clarificationRequest: p.clarificationRequest,
    clarificationResponse: p.clarificationResponse,
    reopenReason: p.reopenReason,

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

    actions: {
      canApprove: ['submitted', 'pending', 'clarification_needed'].includes(p.status),
      canReject: ['submitted', 'pending', 'clarification_needed'].includes(p.status),
      canClarify: ['submitted', 'pending'].includes(p.status),
    },
  };

  if (includeLogs && p.logs) {
    // ✅ Ensure logs are in ascending order (oldest first)
    const sortedLogs = [...p.logs].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });
    result.logs = sortedLogs.map(formatLog);
  }

  return result;
};

// ─── Controller ───────────────────────────────────────────────────────────────
export class ManagerRequestController {
  // GET /manager/requests
  getAllRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = (page - 1) * limit;

      const { status, category, priority, startDate, endDate, search } = req.query as Record<string, string>;

      const where: any = {};
      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Request.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        attributes: ['id', 'title', 'description', 'category', 'priority', 'status', 'submittedAt', 'createdAt'],
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'department'] },
          { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
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

  // GET /manager/requests/pending
  getPendingRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = (page - 1) * limit;

      const where: any = {
        status: { [Op.in]: [RequestStatus.SUBMITTED, RequestStatus.PENDING, RequestStatus.CLARIFICATION] }
      };

      const { count, rows } = await Request.findAndCountAll({
        where,
        order: [['priority', 'ASC'], ['createdAt', 'ASC']],
        limit,
        offset,
        attributes: ['id', 'title', 'description', 'category', 'priority', 'status', 'submittedAt'],
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'department'] },
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

  // GET /manager/requests/:requestId
  getRequestById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const request = await Request.findByPk(req.params.requestId, {
        attributes: [
          'id', 'title', 'description', 'category', 'priority', 'status',
          'comments', 'clarificationRequest', 'clarificationResponse', 'reopenReason',
          'submittedAt', 'createdAt', 'approvedAt', 'rejectedAt', 'closedAt', 'reopenedAt',
        ],
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'department'] },
          { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'admin', attributes: ['id', 'name', 'email'] },
          {
            model: RequestLog,
            as: 'logs',
            // ✅ Ensure logs are in ascending order (oldest first)
            order: [['timestamp', 'ASC']],
            attributes: ['id', 'requestId', 'oldStatus', 'newStatus', 'role', 'action', 'comments', 'timestamp'],
            include: [{ model: User, as: 'changedByUser', attributes: ['id', 'name', 'email'] }],
          },
        ],
      });

      if (!request) throw new AppError('Request not found', 404);

      res.status(200).json({
        success: true,
        data: formatRequest(request, true),
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /manager/requests/:requestId/approve
  approveRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const { requestId } = req.params;
      const { comments } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError('Request not found', 404);
      
      if (!['submitted', 'pending', 'clarification_needed'].includes(request.status)) {
        throw new AppError('Request cannot be approved at this stage', 400);
      }

      const oldStatus = request.status;
      request.status = RequestStatus.APPROVED;
      request.comments = comments || request.comments;
      request.approvedAt = new Date();
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.APPROVED,
        changedBy: userId!,
        role: userRole,
        action: ActionType.STATUS_CHANGE,
        comments: comments || `Request approved by ${userRole}`,
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Request approved successfully',
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /manager/requests/:requestId/reject
  rejectRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const { requestId } = req.params;
      const { reason } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!reason?.trim()) throw new AppError('Rejection reason is required', 400);

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError('Request not found', 404);
      
      if (!['submitted', 'pending', 'clarification_needed'].includes(request.status)) {
        throw new AppError('Request cannot be rejected at this stage', 400);
      }

      const oldStatus = request.status;
      request.status = RequestStatus.REJECTED;
      request.comments = reason;
      request.rejectedAt = new Date();
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.REJECTED,
        changedBy: userId!,
        role: userRole,
        action: ActionType.STATUS_CHANGE,
        comments: `Rejected: ${reason}`,
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Request rejected successfully',
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /manager/requests/:requestId/clarify
  requestClarification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const { requestId } = req.params;
      const { question } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!question?.trim()) throw new AppError('Clarification question is required', 400);

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError('Request not found', 404);
      
      if (!['submitted', 'pending'].includes(request.status)) {
        throw new AppError('Request cannot be sent for clarification at this stage', 400);
      }

      const oldStatus = request.status;
      request.status = RequestStatus.CLARIFICATION;
      request.clarificationRequest = question;
      request.clarificationResponse = null;
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.CLARIFICATION,
        changedBy: userId!,
        role: userRole,
        action: ActionType.CLARIFICATION_REQUESTED,
        comments: question,
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Clarification requested successfully',
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /manager/requests/:requestId/logs
  getRequestLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const logs = await RequestLog.findAll({
        where: { requestId: req.params.requestId },
        attributes: ['id', 'requestId', 'oldStatus', 'newStatus', 'role', 'action', 'comments', 'timestamp'],
        include: [{ model: User, as: 'changedByUser', attributes: ['id', 'name', 'email'] }],
        order: [['timestamp', 'ASC']], // ✅ Ascending order (oldest first)
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

  // GET /manager/dashboard
  getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const [totalRequests, pendingRequests, approvedRequests, rejectedRequests, recentRequests] = await Promise.all([
        Request.count(),
        Request.count({ where: { status: { [Op.in]: ['submitted', 'pending', 'clarification_needed'] } } }),
        Request.count({ where: { status: 'approved' } }),
        Request.count({ where: { status: 'rejected' } }),
        Request.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'title', 'category', 'priority', 'status', 'submittedAt'],
          include: [{ model: User, as: 'user', attributes: ['name'] }],
        }),
      ]);

      const formattedRecent = recentRequests.map((r: any) => {
        const p = r.toJSON();
        return {
          id: p.id,
          title: p.title,
          categoryLabel: CATEGORY_LABELS[p.category] ?? p.category,
          statusDisplay: STATUS_CONFIG[p.status] ?? STATUS_CONFIG.submitted,
          priorityDisplay: PRIORITY_CONFIG[p.priority] ?? PRIORITY_CONFIG.medium,
          user: p.user ? { name: p.user.name } : null,
          submittedAtFormatted: formatIndianDate(p.submittedAt),
        };
      });

      res.status(200).json({
        success: true,
        data: {
          counts: {
            total: totalRequests,
            pending: pendingRequests,
            approved: approvedRequests,
            rejected: rejectedRequests,
          },
          recentRequests: formattedRecent,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ManagerRequestController;