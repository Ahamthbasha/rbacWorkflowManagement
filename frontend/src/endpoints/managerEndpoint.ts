// endpoints/managerEndpoints.ts
const managerEndpoints = {
    managerRegister: '/api/manager/register',
    managerLogin: '/api/manager/login',
    managerLogout: '/api/manager/logout',
    // Dashboard
  managerDashboardStats: '/api/manager/dashboard/stats',
  
  // Request management
  getAssignedRequests: '/api/manager/requests',
  getPendingRequests: '/api/manager/requests/pending',
  getRequestById: (requestId: string) => `/api/manager/requests/${requestId}`,
  getRequestLogs: (requestId: string) => `/api/manager/requests/${requestId}/logs`,
  
  // Actions
  approveRequest: (requestId: string) => `/api/manager/requests/${requestId}/approve`,
  rejectRequest: (requestId: string) => `/api/manager/requests/${requestId}/reject`,
  requestClarification: (requestId: string) => `/api/manager/requests/${requestId}/clarify`,
};

export default managerEndpoints;