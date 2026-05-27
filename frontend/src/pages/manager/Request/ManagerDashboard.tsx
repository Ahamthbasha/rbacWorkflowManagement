// pages/manager/ManagerDashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  RefreshCw
} from 'lucide-react';
import { getDashboardStats } from '../../../api/action/managerAction';
import type { WorkflowRequest } from '../../../types/requestTypes';

// Simple Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; label: string }> = {
    submitted: { color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
    pending: { color: 'bg-blue-100 text-blue-800', label: 'Pending' },
    approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    clarification_needed: { color: 'bg-purple-100 text-purple-800', label: 'Clarification Needed' },
    closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' },
  };
  const { color, label } = config[status] || config.submitted;
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

// Simple Priority Badge Component with safety check
const PriorityBadge = ({ priority }: { priority: string }) => {
  // Safety check for undefined or null priority
  if (!priority) {
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">N/A</span>;
  }
  
  const config: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  
  const priorityLower = priority.toLowerCase();
  const colorClass = config[priorityLower] || config.medium;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {priorityLower.charAt(0).toUpperCase() + priorityLower.slice(1)}
    </span>
  );
};

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    recentRequests: [] as WorkflowRequest[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardStats();
        if (response.success && response.data) {
          setStats({
            total: response.data.counts?.total || 0,
            pending: response.data.counts?.pending || 0,
            approved: response.data.counts?.approved || 0,
            rejected: response.data.counts?.rejected || 0,
            recentRequests: response.data.recentRequests || []
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardStats();
        if (response.success && response.data) {
          setStats({
            total: response.data.counts?.total || 0,
            pending: response.data.counts?.pending || 0,
            approved: response.data.counts?.approved || 0,
            rejected: response.data.counts?.rejected || 0,
            recentRequests: response.data.recentRequests || []
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  };

  const statCards = [
    { title: 'Total Requests', value: stats.total, icon: FileText, color: 'bg-blue-500' },
    { title: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-red-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of all requests</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/manager/requests/pending"
          className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Pending Approvals</h3>
              <p className="text-yellow-100 mt-1">{stats.pending} requests awaiting review</p>
              <span className="inline-block mt-4 text-sm font-medium">Review Now →</span>
            </div>
            <Clock className="h-12 w-12 text-white/20" />
          </div>
        </Link>

        <Link
          to="/manager/requests"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">All Requests</h3>
              <p className="text-blue-100 mt-1">View and manage all requests</p>
              <span className="inline-block mt-4 text-sm font-medium">View All →</span>
            </div>
            <FileText className="h-12 w-12 text-white/20" />
          </div>
        </Link>
      </div>

      {/* Recent Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Requests</h2>
          <Link to="/manager/requests" className="text-blue-600 text-sm font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          {stats.recentRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No requests yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.recentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{request.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.user?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={request.priority || 'medium'} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={request.status || 'submitted'} />
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/manager/requests/${request.id}`} className="text-blue-600 hover:text-blue-700 inline-flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;