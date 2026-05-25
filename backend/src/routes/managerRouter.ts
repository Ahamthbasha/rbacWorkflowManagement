import { Router } from 'express';
import validateRequest from '../utils/validateRequest'; 
import { 
  registerManagerValidator, 
  loginManagerValidator,
} from '../validator/authValidator';
import container from '../diContainer/container';  

const router = Router();
const { managerAuthController, authMiddleware } = container;

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

export default router;