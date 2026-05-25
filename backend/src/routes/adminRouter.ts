
import { Router } from 'express';
import validateRequest from '../utils/validateRequest'; 
import { 
  loginAdminValidator,
} from '../validator/authValidator';
import container from '../diContainer/container';  

const router = Router();
const { adminAuthController, authMiddleware } = container;

router.post(
  '/login',
  loginAdminValidator,
  validateRequest,
  adminAuthController.login.bind(adminAuthController)
);

// Protected routes (require authentication and admin role)
router.use(authMiddleware.authenticate.bind(authMiddleware));
router.use(authMiddleware.isAdmin.bind(authMiddleware));

router.post(
  '/logout',
  adminAuthController.logout.bind(adminAuthController)
);

router.get(
  '/me',
  adminAuthController.getCurrentAdmin.bind(adminAuthController)
);


export default router;