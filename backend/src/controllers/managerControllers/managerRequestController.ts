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

export class ManagerRequestController {
  // Get ALL requests (no managerId filter) - Manager can see all requests
  getAllRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
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

      // Build where clause - NO managerId filter
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

  // Get pending requests (submitted, pending, or clarification needed) - ALL requests
  getPendingRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      // Pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const whereClause: any = {
        status: { [Op.in]: [RequestStatus.SUBMITTED, RequestStatus.PENDING, RequestStatus.CLARIFICATION] }
      };

      const { count, rows } = await Request.findAndCountAll({
        where: whereClause,
        order: [
          ['priority', 'ASC'],
          ['createdAt', 'ASC']
        ],
        limit,
        offset,
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'department'] },
          { model: User, as: 'manager', attributes: ['id', 'name', 'email'] }
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

  // Get single request by ID (for manager view) - No managerId restriction
  getRequestById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
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

      // No authorization check - Manager can view ANY request
      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  // Approve request - Manager can approve ANY request
  approveRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { comments } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const request = await Request.findByPk(requestId);

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      if (request.status !== RequestStatus.SUBMITTED && 
          request.status !== RequestStatus.PENDING && 
          request.status !== RequestStatus.CLARIFICATION) {
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
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Request approved successfully',
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  // Reject request - Manager can reject ANY request
  rejectRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!reason) {
        throw new AppError('Rejection reason is required', 400);
      }

      if (!userRole || userRole !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const request = await Request.findByPk(requestId);

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      if (request.status !== RequestStatus.SUBMITTED && 
          request.status !== RequestStatus.PENDING && 
          request.status !== RequestStatus.CLARIFICATION) {
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
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Request rejected successfully',
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  // Request clarification from user - Manager can request clarification for ANY request
  requestClarification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { question } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!question) {
        throw new AppError('Clarification question is required', 400);
      }

      if (!userRole || userRole !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const request = await Request.findByPk(requestId);

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      if (request.status !== RequestStatus.SUBMITTED && request.status !== RequestStatus.PENDING) {
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
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Clarification requested successfully',
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  // Get request logs - Manager can view logs for ANY request
  getRequestLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
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

  // Get dashboard stats - Manager can see stats for ALL requests
  getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!userRole || userRole !== 'manager') {
        throw new AppError('Access denied. Manager privileges required.', 403);
      }

      const totalRequests = await Request.count();
      const pendingRequests = await Request.count({ 
        where: { 
          status: { [Op.in]: [RequestStatus.SUBMITTED, RequestStatus.PENDING, RequestStatus.CLARIFICATION] }
        } 
      });
      const approvedRequests = await Request.count({ where: { status: RequestStatus.APPROVED } });
      const rejectedRequests = await Request.count({ where: { status: RequestStatus.REJECTED } });

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
          recentRequests
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default ManagerRequestController;