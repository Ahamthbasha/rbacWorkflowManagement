
import { Router } from 'express';
import validateRequest from '../utils/validateRequest'; 
import { 
  loginAdminValidator,
} from '../validator/authValidator';
import container from '../diContainer/container';  

const router = Router();
const { adminAuthController, authMiddleware, adminRequestController } = container;

router.post(
  '/login',
  loginAdminValidator,
  validateRequest,
  adminAuthController.login.bind(adminAuthController)
);

router.use(authMiddleware.authenticate.bind(authMiddleware));
router.use(authMiddleware.isAdmin.bind(authMiddleware));

router.post(
  '/logout',
  adminAuthController.logout.bind(adminAuthController)
);

router.get(
  '/dashboard/stats',
  adminRequestController.getDashboardStats.bind(adminRequestController)
);

router.get(
  '/requests',
  adminRequestController.getAllRequests.bind(adminRequestController)
);

router.get(
  '/requests/:requestId',
  adminRequestController.getRequestById.bind(adminRequestController)
);

router.put(
  '/requests/:requestId/close',
  adminRequestController.closeRequest.bind(adminRequestController)
);

router.put(
  '/requests/:requestId/reopen',
  adminRequestController.reopenRequest.bind(adminRequestController)
);

export default router;