// controllers/requestController.ts
import { Response, NextFunction } from 'express';
import { Op } from 'sequelize'; // Add this import
import { AuthRequest } from '../../middlewares/authMiddleware'; 
import RequestModel, { RequestStatus, RequestPriority, RequestCategory } from '../../models/requestModel';
import RequestLogModel, { ActionType } from '../../models/requestLogModel';
import User from '../../models/userModel'; 
import AppError from '../../utils/appError';

const Request = RequestModel;
const RequestLog = RequestLogModel;

export class RequestController {
  // Create new request
  createRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, category, priority } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const request = await Request.create({
        title,
        description,
        category: category || RequestCategory.OTHER,
        priority: priority || RequestPriority.MEDIUM,
        userId,
        status: RequestStatus.SUBMITTED,
        submittedAt: new Date()
      });

      await RequestLog.create({
        requestId: request.id,
        oldStatus: null,
        newStatus: RequestStatus.SUBMITTED,
        changedBy: userId,
        role: userRole || 'user',
        action: ActionType.CREATE,
        comments: 'Request created',
        timestamp: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Request submitted successfully',
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all requests for current user with filtering and pagination
  getUserRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
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
      const whereClause: any = { userId };

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
          { model: User, as: 'manager', attributes: ['name', 'email'] },
          { model: RequestLog, as: 'logs', limit: 5, order: [['timestamp', 'DESC']] }
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

  // Get single request by REQUEST ID with logs
  getRequestById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

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

      if (userRole === 'user' && request.userId !== userId) {
        throw new AppError('You are not authorized to view this request', 403);
      }

      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  // Update request status (for managers and admins)
  updateRequestStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { status, comments } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const request = await Request.findByPk(requestId);

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      if (userRole === 'user') {
        throw new AppError('Users cannot update request status', 403);
      }

      if (userRole === 'manager' && request.managerId !== userId) {
        throw new AppError('You are not authorized to update this request', 403);
      }

      const oldStatus = request.status;

      request.status = status as RequestStatus;
      request.comments = comments || request.comments;

      if (status === 'approved') {
        request.approvedAt = new Date();
      } else if (status === 'rejected') {
        request.rejectedAt = new Date();
      }

      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: status,
        changedBy: userId!,
        role: userRole!,
        action: ActionType.STATUS_CHANGE,
        comments: comments || `Status changed from ${oldStatus} to ${status}`,
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Request status updated successfully',
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  // Manager asks for clarification
  askClarification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { question } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!question) {
        throw new AppError('Clarification question is required', 400);
      }

      const request = await Request.findByPk(requestId);

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      if (userRole !== 'manager' && userRole !== 'admin') {
        throw new AppError('Only managers can ask for clarification', 403);
      }

      if (userRole === 'manager' && request.managerId !== userId) {
        throw new AppError('You are not authorized to ask clarification for this request', 403);
      }

      const oldStatus = request.status;

      request.status = RequestStatus.CLARIFICATION;
      request.clarificationRequest = question;
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.CLARIFICATION,
        changedBy: userId!,
        role: userRole!,
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

  // User responds to clarification
  respondToClarification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { response } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!response) {
        throw new AppError('Clarification response is required', 400);
      }

      const request = await Request.findByPk(requestId);

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      if (request.userId !== userId) {
        throw new AppError('You are not authorized to respond to this request', 403);
      }

      if (request.status !== RequestStatus.CLARIFICATION) {
        throw new AppError('No clarification requested for this request', 400);
      }

      const oldStatus = request.status;

      request.status = RequestStatus.PENDING;
      request.clarificationResponse = response;
      await request.save();

      await RequestLog.create({
        requestId: request.id,
        oldStatus,
        newStatus: RequestStatus.PENDING,
        changedBy: userId!,
        role: userRole || 'user',
        action: ActionType.CLARIFICATION_RESPONDED,
        comments: response,
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Clarification response submitted successfully',
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
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const request = await Request.findByPk(requestId);

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      if (userRole === 'user' && request.userId !== userId) {
        throw new AppError('You are not authorized to view logs for this request', 403);
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

  // Add these methods to RequestController class

// User edits their own request (only if rejected or submitted)
editRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { title, description, category, priority } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const request = await Request.findByPk(requestId);

    if (!request) {
      throw new AppError('Request not found', 404);
    }

    // Only request owner can edit
    if (request.userId !== userId) {
      throw new AppError('You are not authorized to edit this request', 403);
    }

    // Only rejected or submitted requests can be edited
    if (request.status !== RequestStatus.REJECTED && request.status !== RequestStatus.SUBMITTED) {
      throw new AppError('Request cannot be edited at this stage', 400);
    }

    const oldStatus = request.status;

    // Update request
    request.title = title || request.title;
    request.description = description || request.description;
    request.category = category || request.category;
    request.priority = priority || request.priority;
    request.editedAt = new Date();
    await request.save();

    await RequestLog.create({
      requestId: request.id,
      oldStatus,
      newStatus: request.status,
      changedBy: userId!,
      role: userRole || 'user',
      action: ActionType.EDIT,
      comments: 'Request edited by user',
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Request edited successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// User resubmits rejected request
resubmitRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const request = await Request.findByPk(requestId);

    if (!request) {
      throw new AppError('Request not found', 404);
    }

    // Only request owner can resubmit
    if (request.userId !== userId) {
      throw new AppError('You are not authorized to resubmit this request', 403);
    }

    // Only rejected requests can be resubmitted
    if (request.status !== RequestStatus.REJECTED) {
      throw new AppError('Only rejected requests can be resubmitted', 400);
    }

    const oldStatus = request.status;

    request.status = RequestStatus.PENDING;
    request.resubmittedAt = new Date();
    await request.save();

    await RequestLog.create({
      requestId: request.id,
      oldStatus,
      newStatus: RequestStatus.PENDING,
      changedBy: userId!,
      role: userRole || 'user',
      action: ActionType.RESUBMIT,
      comments: 'Request resubmitted after rejection',
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Request resubmitted successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};
}

export default RequestController;