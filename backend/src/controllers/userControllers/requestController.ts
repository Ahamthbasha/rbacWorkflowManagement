// controllers/requestController.ts
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
import {
  formatLog,
  formatRequestBase,
  attachLogs,
  formatRecentRequest,
} from "../../utils/requestFormatters";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CATEGORY_LABELS,
} from "../../utils/requestConstants";
import DashboardService from "../../services/DashboardService";

const Request = RequestModel;
const RequestLog = RequestLogModel;

// ─── Formatter ────────────────────────────────────────────────────────────────

const formatRequest = (request: any, includeLogs = false) => {
  const p = request.toJSON ? request.toJSON() : request;

  const result: Record<string, any> = {
    ...formatRequestBase(p),
    // Keep raw submittedAt for client-side sorting if needed
    submittedAt: p.submittedAt,
    actions: {
      canClarify: p.status === RequestStatus.CLARIFICATION,
      canEdit:
        p.status === RequestStatus.REJECTED ||
        p.status === RequestStatus.SUBMITTED,
      canCancel:
        p.status === RequestStatus.SUBMITTED ||
        p.status === RequestStatus.PENDING,
    },
  };

  if (includeLogs && p.logs) attachLogs(result, p.logs);
  return result;
};

// ─── Controller ───────────────────────────────────────────────────────────────

export class RequestController {
  private dashboardService: DashboardService;
  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }
  // POST /user/requests
  createRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { title, description, category, priority } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) throw new AppError("User not authenticated", 401);

      const user = await User.findByPk(userId);
      if (!user) throw new AppError("User not found", 404);

      const request = await Request.create({
        title,
        description,
        category: category || RequestCategory.OTHER,
        priority: priority || RequestPriority.MEDIUM,
        userId,
        status: RequestStatus.SUBMITTED,
        submittedAt: new Date(),
      });

      await RequestLog.create({
        requestId: request.id,
        oldStatus: null,
        newStatus: RequestStatus.SUBMITTED,
        changedBy: userId,
        role: userRole || "user",
        action: ActionType.CREATE,
        comments: "Request created",
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        message: "Request submitted successfully",
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /user/requests
  getUserRequests = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError("User not authenticated", 401);

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = (page - 1) * limit;

      const { status, category, priority, startDate, endDate, search } =
        req.query as Record<string, string>;

      const whereClause: any = { userId };
      if (status) whereClause.status = status;
      if (category) whereClause.category = category;
      if (priority) whereClause.priority = priority;
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Request.findAndCountAll({
        where: whereClause,
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
          "comments",
          "clarificationRequest",
          "clarificationResponse",
        ],
        include: [
          { model: User, as: "manager", attributes: ["name", "email"] },
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

  // GET /user/requests/:requestId
  getRequestById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) throw new AppError("User not authenticated", 401);

      const request = await Request.findByPk(requestId, {
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
          "submittedAt",
          "createdAt",
          "approvedAt",
          "rejectedAt",
          "closedAt",
          "reopenedAt",
          "userId",
          "managerId",
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

      const isAuthorized =
        userRole === "admin" ||
        (userRole === "manager" &&
          (request.userId === userId || request.managerId === userId)) ||
        (userRole === "user" && request.userId === userId);

      if (!isAuthorized)
        throw new AppError("You are not authorized to view this request", 403);

      res
        .status(200)
        .json({ success: true, data: formatRequest(request, true) });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /user/requests/:requestId/edit
  editRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { title, description, category, priority } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError("Request not found", 404);
      if (request.userId !== userId)
        throw new AppError("You are not authorized to edit this request", 403);
      if (request.status !== RequestStatus.REJECTED)
        throw new AppError("Only rejected requests can be edited", 400);

      request.title = title || request.title;
      request.description = description || request.description;
      request.category = category || request.category;
      request.priority = priority || request.priority;
      request.editedAt = new Date();
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus: request.status,
        newStatus: request.status,
        changedBy: userId!,
        role: userRole || "user",
        action: ActionType.EDIT,
        comments: "Request edited by user",
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Request edited successfully",
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /user/requests/:requestId/resubmit
  resubmitRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError("Request not found", 404);
      if (request.userId !== userId)
        throw new AppError(
          "You are not authorized to resubmit this request",
          403,
        );
      if (request.status !== RequestStatus.REJECTED)
        throw new AppError("Only rejected requests can be resubmitted", 400);

      const oldStatus = request.status;
      request.status = RequestStatus.PENDING;
      request.resubmittedAt = new Date();
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.PENDING,
        changedBy: userId!,
        role: userRole || "user",
        action: ActionType.RESUBMIT,
        comments: "Request resubmitted after editing",
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Request resubmitted successfully",
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /user/requests/:requestId/clarify
  respondToClarification = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { response } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!response)
        throw new AppError("Clarification response is required", 400);

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError("Request not found", 404);
      if (request.userId !== userId)
        throw new AppError(
          "You are not authorized to respond to this request",
          403,
        );
      if (request.status !== RequestStatus.CLARIFICATION)
        throw new AppError("No clarification requested for this request", 400);

      const oldStatus = request.status;
      request.status = RequestStatus.PENDING;
      request.clarificationResponse = response;
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.PENDING,
        changedBy: userId!,
        role: userRole || "user",
        action: ActionType.CLARIFICATION_RESPONDED,
        comments: response,
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Clarification response submitted successfully",
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /user/requests/:requestId/cancel
  cancelRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError("Request not found", 404);
      if (request.userId !== userId)
        throw new AppError(
          "You are not authorized to cancel this request",
          403,
        );
      if (
        request.status !== RequestStatus.SUBMITTED &&
        request.status !== RequestStatus.PENDING
      )
        throw new AppError("Request cannot be cancelled at this stage", 400);

      const oldStatus = request.status;
      request.status = RequestStatus.CANCELLED;
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.CANCELLED,
        changedBy: userId!,
        role: userRole || "user",
        action: ActionType.STATUS_CHANGE,
        comments: "User cancelled the request",
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: "Request cancelled successfully",
        data: formatRequest(request),
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /user/requests/:requestId/logs
  getRequestLogs = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const request = await Request.findByPk(requestId);
      if (!request) throw new AppError("Request not found", 404);

      const isAuthorized =
        userRole === "admin" ||
        (userRole === "manager" &&
          (request.userId === userId || request.managerId === userId)) ||
        (userRole === "user" && request.userId === userId);

      if (!isAuthorized)
        throw new AppError(
          "You are not authorized to view logs for this request",
          403,
        );

      const logs = await RequestLog.findAll({
        where: { requestId },
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

  getUserDashboardStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError("User not authenticated", 401);

      const stats = await DashboardService.getDashboardStats({
        userId,
        userRole: "user",
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

export default RequestController;
