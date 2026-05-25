import { Router } from 'express';
import validateRequest from '../utils/validateRequest'; 
import { 
  registerValidator, 
  loginValidator, 
} from '../validator/authValidator';
import container from '../diContainer/container';  
const router = Router();
const { userAuthController, authMiddleware,} = container;

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



export default router;