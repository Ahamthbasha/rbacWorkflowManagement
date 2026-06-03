
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
  RotateCcw,
  Archive,
} from 'lucide-react';
import { getUserDashboardStats, type UserDashboardStats } from '../../../api/action/userAction';
import StatCard from '../../../components/common/Statscard';
import RecentRequestsTable from '../../../components/common/RecentRequestTable';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
);

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response = await getUserDashboardStats();
        if (cancelled) return;
        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          toast.error(response.message || 'Failed to load dashboard data');
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Failed to load dashboard data';
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No dashboard data available</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { counts, recentRequests } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of your service requests</p>
      </div>

      {/* Stat Cards — one per count field from the API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total"
          value={counts.total}
          icon={FileText}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Submitted"
          value={counts.submitted}
          icon={FileText}
          iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label="Pending"
          value={counts.pending}
          icon={Clock}
          iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
          iconColor="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          label="Approved"
          value={counts.approved}
          icon={CheckCircle}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          icon={XCircle}
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
        />
        <StatCard
          label="Clarification"
          value={counts.clarification}
          icon={AlertCircle}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="Closed"
          value={counts.closed}
          icon={Archive}
          iconBgColor="bg-gray-100 dark:bg-gray-700"
          iconColor="text-gray-600 dark:text-gray-400"
        />
        <StatCard
          label="Cancelled"
          value={counts.cancelled}
          icon={Ban}
          iconBgColor="bg-rose-100 dark:bg-rose-900/30"
          iconColor="text-rose-600 dark:text-rose-400"
        />
        <StatCard
          label="Reopened"
          value={counts.reopened}
          icon={RotateCcw}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Recent Requests */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Requests
        </h2>
        <RecentRequestsTable requests={recentRequests} />
      </div>
    </div>
  );
};

export default UserDashboard;