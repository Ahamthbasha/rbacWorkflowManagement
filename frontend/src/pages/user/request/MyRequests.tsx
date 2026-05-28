// pages/user/request/MyRequests.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';
import RequestTable from '../../../components/common/RequestTable';
import type { FilterOptions } from '../../../components/common/RequestTable';
import type { WorkflowRequest } from '../../../types/requestTypes';
import { getUserRequests } from '../../../api/action/userAction';

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({});

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 10,
      };
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await getUserRequests(params);

      if (response.success) {
        setRequests(response.data || []);
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, [fetchRequests]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchRequests();
  };

  const pagination = {
    total,
    page,
    limit: 10,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Requests</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all your workflow requests</p>
          </div>
          <button
            onClick={() => navigate('/createRequest')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Request
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
      />
    </div>
  );
};

export default MyRequests;