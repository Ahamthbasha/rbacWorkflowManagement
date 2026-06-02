const userRouterEndPoints = {
  userRegister: '/api/user/register',
  userLogin: '/api/user/login',
  userLogout: '/api/user/logout',
  userDashboard: '/api/user/dashboard',
  createRequest: '/api/user/requests',
  getUserRequests: '/api/user/requests',
  getRequestById: (requestId: string) => `/api/user/requests/${requestId}`,
  editAndResubmitRequest: (requestId: string) => `/api/user/requests/${requestId}/editResubmit`,
  respondToClarification: (requestId: string) => `/api/user/requests/${requestId}/clarify`,
};

export default userRouterEndPoints;