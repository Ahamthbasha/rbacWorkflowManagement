import { Router } from 'express';
import validateRequest from '../utils/validateRequest'; 
import { 
  registerManagerValidator, 
  loginManagerValidator,
} from '../validator/authValidator';
import container from '../diContainer/container';  

const router = Router();
const { managerAuthController, authMiddleware, managerRequestController } = container;

router.post(
  '/register',
  registerManagerValidator,
  validateRequest,
  managerAuthController.register.bind(managerAuthController)
);

router.post(
  '/login',
  loginManagerValidator,
  validateRequest,
  managerAuthController.login.bind(managerAuthController)
);

// Protected routes (require authentication and manager role)
router.use(authMiddleware.authenticate.bind(authMiddleware));
router.use(authMiddleware.isManager.bind(authMiddleware));

router.post(
  '/logout',
  managerAuthController.logout.bind(managerAuthController)
);

router.get(
  '/me',
  managerAuthController.getCurrentManager.bind(managerAuthController)
);

// Dashboard
router.get(
  '/dashboard/stats',
  managerRequestController.getDashboardStats.bind(managerRequestController)
);

// Request management
router.get(
  '/requests',
  managerRequestController.getAllRequests.bind(managerRequestController)
);

router.get(
  '/requests/pending',
  managerRequestController.getPendingRequests.bind(managerRequestController)
);

router.get(
  '/requests/:requestId',
  managerRequestController.getRequestById.bind(managerRequestController)
);

router.get(
  '/requests/:requestId/logs',
  managerRequestController.getRequestLogs.bind(managerRequestController)
);

// Actions
router.put(
  '/requests/:requestId/approve',
  managerRequestController.approveRequest.bind(managerRequestController)
);

router.put(
  '/requests/:requestId/reject',
  managerRequestController.rejectRequest.bind(managerRequestController)
);

router.post(
  '/requests/:requestId/clarify',
  managerRequestController.requestClarification.bind(managerRequestController)
);

export default router;