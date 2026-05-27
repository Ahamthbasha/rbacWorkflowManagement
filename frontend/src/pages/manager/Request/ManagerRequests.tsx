// pages/manager/requests/ManagerRequests.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RefreshCw, Eye } from 'lucide-react';
import RequestTable from '../../../components/common/RequestTable';
import type { FilterOptions } from '../../../components/common/RequestTable';
import type { WorkflowRequest } from '../../../types/requestTypes';
import { getAssignedRequests } from '../../../api/action/managerAction';

const ManagerRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = await getAssignedRequests({
          page,
          limit: 10,
          status: filters.status,
          category: filters.category,
          priority: filters.priority,
          search: filters.search,
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
        if (!cancelled && response.success) {
          setRequests(response.data);
          setPagination(response.pagination);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching requests:', error);
          toast.error('Failed to load requests');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page, filters, refreshKey]);

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Assigned Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and manage requests assigned to you
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <RequestTable
        requests={requests}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        onFilterChange={handleFilterChange}
        showActions={true}
        customAction={(request: WorkflowRequest) => (
          <button
            onClick={() => navigate(`/manager/requests/${request.id}`)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            Review
          </button>
        )}
      />
    </div>
  );
};

export default ManagerRequests;