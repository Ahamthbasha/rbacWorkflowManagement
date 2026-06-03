import { Response, NextFunction } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../../middlewares/authMiddleware";
import RequestModel, { RequestStatus } from "../../models/requestModel";
import RequestLogModel, { ActionType } from "../../models/requestLogModel";
import User from "../../models/userModel";
import AppError from "../../utils/appError";
import { formatRequestBase, attachLogs } from "../../utils/requestFormatters";
import DashboardService from "../../services/DashboardService";

const Request = RequestModel;
const RequestLog = RequestLogModel;

const formatRequest = (request: any, includeLogs = false) => {
  const p = request.toJSON ? request.toJSON() : request;

  const result: Record<string, any> = {
    ...formatRequestBase(p),
    actions: {
      canClose: p.status === RequestStatus.APPROVED,
      canReopen:
        p.status === RequestStatus.CLOSED ||
        p.status === RequestStatus.CANCELLED,
    },
  };

  if (includeLogs && p.logs) attachLogs(result, p.logs);
  return result;
};

export class AdminRequestController {
  private dashboardService: DashboardService;
  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }

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
            attributes: ["id", "name", "email"],
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
            attributes: ["id", "name", "email"],
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
      if (request.status !== RequestStatus.APPROVED)
        throw new AppError("Only approved requests can be closed", 400);

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
      )
        throw new AppError(
          "Only closed or cancelled requests can be reopened",
          400,
        );

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

  getDashboardStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user?.role !== "admin")
        throw new AppError("Access denied. Admin privileges required.", 403);

      const stats = await DashboardService.getDashboardStats({
        userRole: req.user.role,
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

export default AdminRequestController;
