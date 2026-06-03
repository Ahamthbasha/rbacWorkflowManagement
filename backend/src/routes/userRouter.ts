import { Router } from "express";
import validateRequest from "../utils/validateRequest";
import { registerValidator, loginValidator } from "../validator/authValidator";
import container from "../diContainer/container";
import {
  createRequestValidator,
  editRequestValidator,
} from "../validator/requestValidator";
const router = Router();
const { userAuthController, authMiddleware, userRequestController } = container;

router.post(
  "/register",
  registerValidator,
  validateRequest,
  userAuthController.register.bind(userAuthController),
);

router.post(
  "/login",
  loginValidator,
  validateRequest,
  userAuthController.login.bind(userAuthController),
);

router.post(
  "/logout",
  authMiddleware.authenticate.bind(authMiddleware),
  userAuthController.logout.bind(userAuthController),
);

router.use(authMiddleware.authenticate.bind(authMiddleware));
router.use(authMiddleware.isUser.bind(authMiddleware));

router.get(
  "/dashboard",
  userRequestController.getUserDashboardStats.bind(userRequestController),
);

router.post(
  "/requests",
  createRequestValidator,
  validateRequest,
  userRequestController.createRequest.bind(userRequestController),
);

router.get(
  "/requests",
  userRequestController.getUserRequests.bind(userRequestController),
);

router.get(
  "/requests/:requestId",
  userRequestController.getRequestById.bind(userRequestController),
);

router.put(
  "/requests/:requestId/editResubmit",
  editRequestValidator,
  validateRequest,
  userRequestController.editAndResubmitRequest.bind(userRequestController),
);

router.put(
  "/requests/:requestId/clarify",
  userRequestController.respondToClarification.bind(userRequestController),
);

export default router;
