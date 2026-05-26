import { Router } from 'express';
import validateRequest from '../utils/validateRequest'; 
import { 
  registerValidator, 
  loginValidator, 
} from '../validator/authValidator';
import container from '../diContainer/container';  
import { createRequestValidator } from '../validator/requestValidator';
const router = Router();
const { userAuthController, authMiddleware,userRequestController} = container;

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

// ==================== REQUEST MANAGEMENT ====================

// Create a new request
// POST /api/user/requests
router.post(
  '/requests',
  createRequestValidator,
  validateRequest,
  userRequestController.createRequest.bind(userRequestController)
);

// Get all requests for the authenticated user
// GET /api/user/requests
router.get(
  '/requests',
  userRequestController.getUserRequests.bind(userRequestController)
);

// Get a specific request by REQUEST ID
// GET /api/user/requests/:requestId
router.get(
  '/requests/:requestId',
  userRequestController.getRequestById.bind(userRequestController)
);

// Get request logs/history by REQUEST ID
// GET /api/user/requests/:requestId/logs
router.get(
  '/requests/:requestId/logs',
  userRequestController.getRequestLogs.bind(userRequestController)
);

// ==================== CLARIFICATION RESPONSES ====================

// Respond to clarification request from manager
// PUT /api/user/requests/:requestId/clarify
router.put(
  '/requests/:requestId/clarify',
  userRequestController.respondToClarification.bind(userRequestController)
);

// ==================== CANCEL REQUEST ====================

// Cancel a pending request (only if status is 'submitted' or 'pending')
// DELETE /api/user/requests/:requestId/cancel
router.delete(
  '/requests/:requestId/cancel',
  userRequestController.cancelRequest.bind(userRequestController)
);


export default router;