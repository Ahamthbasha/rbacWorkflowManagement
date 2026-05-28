// controllers/managerControllers/managerRequestController.ts
import { Response, NextFunction } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../../middlewares/authMiddleware";
import RequestModel, { RequestStatus } from "../../models/requestModel";
import RequestLogModel, { ActionType } from "../../models/requestLogModel";
import User from "../../models/userModel";
import AppError from "../../utils/appError";
import {
  formatLog,
  formatRequestBase,
  attachLogs,
  formatRecentRequest,
} from "../../utils/requestFormatters";
import DashboardService from "../../services/DashboardService";

const Request = RequestModel;
const RequestLog = RequestLogModel;

// ─── Formatter ────────────────────────────────────────────────────────────────

const formatRequest = (request: any, includeLogs = false) => {
  const p = request.toJSON ? request.toJSON() : request;

  const result: Record<string, any> = {
    ...formatRequestBase(p),
    actions: {
      canApprove: ["submitted", "pending", "clarification_needed"].includes(
        p.status,
      ),
      canReject: ["submitted", "pending", "clarification_needed"].includes(
        p.status,
      ),
      canClarify: ["submitted", "pending"].includes(p.status),
    },
  };

  if (includeLogs && p.logs) attachLogs(result, p.logs);
  return result;
};

// ─── Controller ───────────────────────────────────────────────────────────────

export class ManagerRequestController {
  private dashboardService: DashboardService;
  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }
  // GET /manager/requests
  getAllRequests = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "manager")
        throw new AppError("Access denied. Manager privileges required.", 403);

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

  // GET /manager/requests/pending
  getPendingRequests = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "manager")
        throw new AppError("Access denied. Manager privileges required.", 403);

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await Request.findAndCountAll({
        where: {
          status: {
            [Op.in]: [
              RequestStatus.SUBMITTED,
              RequestStatus.PENDING,
              RequestStatus.CLARIFICATION,
            ],
          },
        },
        order: [
          ["priority", "ASC"],
          ["createdAt", "ASC"],
        ],
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
        ],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "department"],
          },
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
  getRequestById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "manager")
        throw new AppError("Access denied. Manager privileges required.", 403);

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

      res
        .status(200)
        .json({ success: true, data: formatRequest(request, true) });
    } catch (error) {
      next(error);
    }
  };

  // PUT /manager/requests/:requestId/approve
  approveRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "manager")
        throw new AppError("Access denied. Manager privileges required.", 403);

      const { requestId } = req.params;
      const { comments } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError("Request not found", 404);
      if (
        !["submitted", "pending", "clarification_needed"].includes(
          request.status,
        )
      )
        throw new AppError("Request cannot be approved at this stage", 400);

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
        message: "Request approved successfully",
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /manager/requests/:requestId/reject
  rejectRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "manager")
        throw new AppError("Access denied. Manager privileges required.", 403);

      const { requestId } = req.params;
      const { reason } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!reason?.trim())
        throw new AppError("Rejection reason is required", 400);

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError("Request not found", 404);
      if (
        !["submitted", "pending", "clarification_needed"].includes(
          request.status,
        )
      )
        throw new AppError("Request cannot be rejected at this stage", 400);

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
        message: "Request rejected successfully",
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /manager/requests/:requestId/clarify
  requestClarification = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "manager")
        throw new AppError("Access denied. Manager privileges required.", 403);

      const { requestId } = req.params;
      const { question } = req.body;
      const userId = req.user.userId;
      const userRole = req.user.role;

      if (!question?.trim())
        throw new AppError("Clarification question is required", 400);

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError("Request not found", 404);
      if (!["submitted", "pending"].includes(request.status))
        throw new AppError(
          "Request cannot be sent for clarification at this stage",
          400,
        );

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
        message: "Clarification requested successfully",
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /manager/requests/:requestId/logs
  getRequestLogs = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "manager")
        throw new AppError("Access denied. Manager privileges required.", 403);

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

      res
        .status(200)
        .json({ success: true, count: logs.length, data: logs.map(formatLog) });
    } catch (error) {
      next(error);
    }
  };

  getDashboardStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "manager")
        throw new AppError("Access denied. Manager privileges required.", 403);

      // Get manager's department
      const manager = await User.findByPk(req.user.userId);

      const stats = await DashboardService.getDashboardStats({
        userRole: req.user.role,
        department: manager?.department,
      });

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ManagerRequestController;
