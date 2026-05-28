// routes/userRouter.ts
import { Router } from 'express';
import validateRequest from '../utils/validateRequest'; 
import { 
  registerValidator, 
  loginValidator, 
} from '../validator/authValidator';
import container from '../diContainer/container';  
import { createRequestValidator } from '../validator/requestValidator';
const router = Router();
const { userAuthController, authMiddleware, userRequestController } = container;

router.post(
  '/register',
  registerValidator,
  validateRequest,
  userAuthController.register.bind(userAuthController)
);

router.post(
  '/login',
  loginValidator,
  validateRequest,
  userAuthController.login.bind(userAuthController)
);

router.post(
  '/logout',
  authMiddleware.authenticate.bind(authMiddleware),
  userAuthController.logout.bind(userAuthController)
);

// All user request routes require authentication
router.use(authMiddleware.authenticate.bind(authMiddleware));
router.use(authMiddleware.isUser.bind(authMiddleware));

router.get(
  '/dashboard',
  userRequestController.getUserDashboardStats.bind(userRequestController)
);

// ==================== REQUEST MANAGEMENT ====================

// Create a new request
router.post(
  '/requests',
  createRequestValidator,
  validateRequest,
  userRequestController.createRequest.bind(userRequestController)
);

// Get all requests for the authenticated user
router.get(
  '/requests',
  userRequestController.getUserRequests.bind(userRequestController)
);

// Get a specific request by REQUEST ID
router.get(
  '/requests/:requestId',
  userRequestController.getRequestById.bind(userRequestController)
);

// Get request logs/history by REQUEST ID
router.get(
  '/requests/:requestId/logs',
  userRequestController.getRequestLogs.bind(userRequestController)
);

// ==================== EDIT & RESUBMIT (Only for rejected requests) ====================

// Edit rejected request
router.put(
  '/requests/:requestId/edit',
  userRequestController.editRequest.bind(userRequestController)
);

// Resubmit rejected request after editing
router.put(
  '/requests/:requestId/resubmit',
  userRequestController.resubmitRequest.bind(userRequestController)
);

// ==================== CLARIFICATION RESPONSES ====================

// Respond to clarification request from manager
router.put(
  '/requests/:requestId/clarify',
  userRequestController.respondToClarification.bind(userRequestController)
);

export default router;