// pages/user/request/MyRequests.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';
import RequestTable from '../../../components/common/RequestTable';
import type { FilterOptions } from '../../../components/common/RequestTable';
import type { WorkflowRequest } from '../../../types/requestTypes';
import { getUserRequests } from '../../../api/action/userAction';

const MyRequests = () => {
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<FilterOptions>({});
  const [fetchTrigger, setFetchTrigger] = useState<{
    page: number;
    filterParams: FilterOptions;
  }>({ page: 1, filterParams: {} });

  useEffect(() => {
    const { page, filterParams } = fetchTrigger;
    const abortController = new AbortController();

    const run = async () => {
      setLoading(true);
      try {
        // ✅ Build plain object — axios serialises this as ?key=value query string
        const params: Record<string, string> = {
          page: page.toString(),
          limit: '10',
        };

        if (filterParams.status)    params.status    = filterParams.status;
        if (filterParams.category)  params.category  = filterParams.category;
        if (filterParams.priority)  params.priority  = filterParams.priority;
        if (filterParams.search)    params.search    = filterParams.search;
        if (filterParams.startDate) params.startDate = filterParams.startDate;
        if (filterParams.endDate)   params.endDate   = filterParams.endDate;

        const response = await getUserRequests(params); // ✅ params forwarded to API

        if (abortController.signal.aborted) return;

        if (response.success) {
          const total = response.count ?? response.data?.length ?? 0;
          setRequests(response.data ?? []);
          setPagination(prev => ({
            ...prev,
            page,
            total,
            totalPages: Math.ceil(total / prev.limit),
            hasNextPage: page < Math.ceil(total / prev.limit),
            hasPrevPage: page > 1,
          }));
        }
      } catch (error) {
        if (abortController.signal.aborted) return;
        console.error('Error fetching requests:', error);
        toast.error('Failed to load requests');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      abortController.abort();
      isMounted.current = false;
    };
  }, [fetchTrigger]);

  const handlePageChange = (page: number) => {
    setFetchTrigger({ page, filterParams: filters });
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setFetchTrigger({ page: 1, filterParams: newFilters });
  };

  const handleRefresh = () => {
    // Spread into a new object reference to re-trigger the effect
    setFetchTrigger(prev => ({ ...prev }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              My Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage all your workflow requests
            </p>
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