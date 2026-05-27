// controllers/adminControllers/adminRequestController.ts
import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../../middlewares/authMiddleware';
import RequestModel, { RequestStatus, RequestPriority, RequestCategory } from '../../models/requestModel';
import RequestLogModel, { ActionType } from '../../models/requestLogModel';
import User from '../../models/userModel';
import AppError from '../../utils/appError';

const Request = RequestModel;
const RequestLog = RequestLogModel;

export class AdminRequestController {
  // Get all requests with pagination and filters
  getAllRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'admin') {
        throw new AppError('Access denied. Admin privileges required.', 403);
      }

      // Pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Filter parameters
      const status = req.query.status as string;
      const category = req.query.category as string;
      const priority = req.query.priority as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const search = req.query.search as string;

      // Build where clause
      const whereClause: any = {};

      if (status) {
        whereClause.status = status;
      }
      if (category) {
        whereClause.category = category;
      }
      if (priority) {
        whereClause.priority = priority;
      }
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Request.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'department'] },
          { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'admin', attributes: ['id', 'name', 'email'] },
          { model: RequestLog, as: 'logs', limit: 3, order: [['timestamp', 'DESC']] }
        ]
      });

      res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get single request by ID with full details and logs
  getRequestById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'admin') {
        throw new AppError('Access denied. Admin privileges required.', 403);
      }

      const request = await Request.findByPk(requestId, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'department'] },
          { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'admin', attributes: ['id', 'name', 'email'] },
          { model: RequestLog, as: 'logs', order: [['timestamp', 'ASC']] }
        ]
      });

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  // Close a request - Only admin can close approved requests
  closeRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { closureNote } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'admin') {
        throw new AppError('Access denied. Admin privileges required.', 403);
      }

      const request = await Request.findByPk(requestId);

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      // Only approved requests can be closed
      if (request.status !== RequestStatus.APPROVED) {
        throw new AppError('Only approved requests can be closed', 400);
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
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Request closed successfully',
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  // Reopen a request - Admin reopens closed/cancelled request back to PENDING status
  reopenRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!reason) {
        throw new AppError('Reopen reason is required', 400);
      }

      if (!userRole || userRole !== 'admin') {
        throw new AppError('Access denied. Admin privileges required.', 403);
      }

      const request = await Request.findByPk(requestId);

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      // Only closed or cancelled requests can be reopened
      if (request.status !== RequestStatus.CLOSED && request.status !== RequestStatus.CANCELLED) {
        throw new AppError('Only closed or cancelled requests can be reopened', 400);
      }

      const oldStatus = request.status;

      // Reopen to PENDING status - back to normal workflow
      request.status = RequestStatus.PENDING;
      request.comments = reason;
      request.closedAt = null;
      request.approvedAt = null;
      request.rejectedAt = null;
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.PENDING,
        changedBy: userId!,
        role: userRole,
        action: ActionType.STATUS_CHANGE,
        comments: `Reopened for further review: ${reason}`,
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Request reopened successfully. It is now pending manager review.',
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  // Get request logs by REQUEST ID
  getRequestLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'admin') {
        throw new AppError('Access denied. Admin privileges required.', 403);
      }

      const request = await Request.findByPk(requestId);

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      const logs = await RequestLog.findAll({
        where: { requestId },
        include: [
          { model: User, as: 'changedByUser', attributes: ['id', 'name', 'email'] }
        ],
        order: [['timestamp', 'ASC']]
      });

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  };

  // Get dashboard stats for admin
  getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'admin') {
        throw new AppError('Access denied. Admin privileges required.', 403);
      }

      const totalRequests = await Request.count();
      const pendingRequests = await Request.count({ 
        where: { 
          status: { [Op.in]: [RequestStatus.SUBMITTED, RequestStatus.PENDING, RequestStatus.CLARIFICATION] }
        } 
      });
      const approvedRequests = await Request.count({ where: { status: RequestStatus.APPROVED } });
      const rejectedRequests = await Request.count({ where: { status: RequestStatus.REJECTED } });
      const closedRequests = await Request.count({ where: { status: RequestStatus.CLOSED } });
      const cancelledRequests = await Request.count({ where: { status: RequestStatus.CANCELLED } });

      // Get recent requests
      const recentRequests = await Request.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, as: 'user', attributes: ['name', 'email', 'department'] },
          { model: User, as: 'manager', attributes: ['name', 'email'] }
        ]
      });

      res.status(200).json({
        success: true,
        data: {
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          closedRequests,
          cancelledRequests,
          recentRequests
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminRequestController;