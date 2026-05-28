// pages/user/dashboard/UserDashboard.tsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  List,
  Eye,
  RefreshCw,
  XOctagon,
} from 'lucide-react';
import { getUserDashboardStats } from '../../../api/action/userAction';
import type { UserDashboardStats } from '../../../api/action/userAction';

// ─── Badge Components ─────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { color: string; label: string }> = {
    submitted:            { color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
    pending:              { color: 'bg-blue-100 text-blue-800',     label: 'Pending' },
    approved:             { color: 'bg-green-100 text-green-800',   label: 'Approved' },
    rejected:             { color: 'bg-red-100 text-red-800',       label: 'Rejected' },
    clarification_needed: { color: 'bg-purple-100 text-purple-800', label: 'Clarification Needed' },
    closed:               { color: 'bg-gray-100 text-gray-800',     label: 'Closed' },
    cancelled:            { color: 'bg-orange-100 text-orange-800', label: 'Cancelled' },
  };
  const { color, label } = config[status] ?? config.submitted;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  if (!priority) {
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">N/A</span>;
  }
  const config: Record<string, string> = {
    low:    'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high:   'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  const key = priority.toLowerCase();
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[key] ?? config.medium}`}>
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </span>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const UserDashboard = () => {
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getUserDashboardStats();
        if (isMounted.current && response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [refreshToken]);

  const handleRefresh = () => setRefreshToken((prev) => prev + 1);

  const statCards = [
    { title: 'Total Requests',      value: stats?.counts.total          ?? 0, icon: FileText,    color: 'bg-blue-500'   },
    { title: 'Submitted',           value: stats?.counts.submitted       ?? 0, icon: Clock,       color: 'bg-yellow-500' },
    { title: 'Pending',             value: stats?.counts.pending         ?? 0, icon: Clock,       color: 'bg-blue-400'   },
    { title: 'Approved',            value: stats?.counts.approved        ?? 0, icon: CheckCircle, color: 'bg-green-500'  },
    { title: 'Rejected',            value: stats?.counts.rejected        ?? 0, icon: XCircle,     color: 'bg-red-500'    },
    { title: 'Needs Clarification', value: stats?.counts.clarification   ?? 0, icon: AlertCircle, color: 'bg-purple-500' },
    { title: 'Cancelled',           value: stats?.counts.cancelled       ?? 0, icon: XOctagon,    color: 'bg-orange-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your requests</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
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
          to="/createRequest"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">New Request</h3>
              <p className="text-blue-100 mt-1">Submit a new request for approval</p>
              <span className="inline-block mt-4 text-sm font-medium">Create Now →</span>
            </div>
            <Plus className="h-12 w-12 text-white/20" />
          </div>
        </Link>

        <Link
          to="/myRequests"
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">My Requests</h3>
              <p className="text-purple-100 mt-1">View and manage all your requests</p>
              <span className="inline-block mt-4 text-sm font-medium">View All →</span>
            </div>
            <List className="h-12 w-12 text-white/20" />
          </div>
        </Link>
      </div>

      {/* Recent Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Requests</h2>
          <Link to="/myRequests" className="text-blue-600 text-sm font-medium hover:underline">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          {!stats?.recentRequests.length ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No requests yet</p>
              <Link
                to="/createRequest"
                className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first request
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                        {request.title}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {request.categoryLabel}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={request.priorityDisplay?.label ?? 'medium'} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={request.statusDisplay?.label?.toLowerCase().replace(/ /g, '_') ?? 'submitted'} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {request.submittedAtFormatted}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/requests/${request.id}`}
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center text-sm"
                      >
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

export default UserDashboard;