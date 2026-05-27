const adminRouterEndPoints = {
    adminLogin: '/api/admin/login',
    adminLogout: '/api/admin/logout',
  
  // Dashboard
  adminDashboardStats: '/api/admin/dashboard/stats',
  
  // Request management
  getAllRequests: '/api/admin/requests',
  getRequestById: (requestId: string) => `/api/admin/requests/${requestId}`,
  getRequestLogs: (requestId: string) => `/api/admin/requests/${requestId}/logs`,
  
  // Admin actions
  closeRequest: (requestId: string) => `/api/admin/requests/${requestId}/close`,
  reopenRequest: (requestId: string) => `/api/admin/requests/${requestId}/reopen`,
}

export default adminRouterEndPoints;