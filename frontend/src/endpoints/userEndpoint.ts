// endpoints/userEndpoint.ts
const userRouterEndPoints = {
  userRegister: '/api/user/register',
  userLogin: '/api/user/login',
  userLogout: '/api/user/logout',
  userProfile: '/api/user/profile',
  userDashboard: '/api/user/dashboard',
  createRequest: '/api/user/requests',
  getUserRequests: '/api/user/requests',
  getRequestById: (requestId: string) => `/api/user/requests/${requestId}`,
  getRequestLogs: (requestId: string) => `/api/user/requests/${requestId}/logs`,
  respondToClarification: (requestId: string) => `/api/user/requests/${requestId}/clarify`,
  cancelRequest: (requestId: string) => `/api/user/requests/${requestId}/cancel`,
  editRequest: (requestId: string) => `/api/user/requests/${requestId}/edit`,
  resubmitRequest: (requestId: string) => `/api/user/requests/${requestId}/resubmit`,
};

export default userRouterEndPoints;