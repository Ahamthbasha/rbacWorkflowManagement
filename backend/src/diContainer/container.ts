import { JwtService } from '../services/jwtService';

import { AuthService } from '../services/authService';
import UserAuthController from '../controllers/userControllers/userAuthController';
import ManagerAuthController from '../controllers/managerControllers/managerAuthController';
import AdminAuthController from '../controllers/adminControllers/adminAuthController';

import AuthMiddleware from '../middlewares/authMiddleware';
import RequestController from '../controllers/userControllers/requestController';


class DIContainer {
  private static instance: DIContainer;
  
  public jwtService: JwtService;
  public authService: AuthService;
  

  public userAuthController: UserAuthController;
  public userRequestController : RequestController;
  public managerAuthController: ManagerAuthController;
  public adminAuthController: AdminAuthController;

  public authMiddleware: AuthMiddleware;

  private constructor() {
    this.jwtService = new JwtService();
    
    this.authService = new AuthService(this.jwtService);
    this.userAuthController = new UserAuthController(this.authService)
    this.managerAuthController = new ManagerAuthController(this.authService)
    this.adminAuthController = new AdminAuthController(this.jwtService);
    this.authMiddleware = new AuthMiddleware(this.jwtService);
    this.userRequestController = new RequestController()
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}

export const container = DIContainer.getInstance();
export default container;