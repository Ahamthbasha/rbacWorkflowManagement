
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import RequestTable from '../../../components/common/RequestTable';
import type { FilterOptions } from '../../../components/common/RequestTable';
import type { WorkflowRequest } from '../../../types/requestTypes';
import { getAllRequests } from '../../../api/action/adminAction';

const AdminRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0, page: 1, limit: 10,
    totalPages: 0, hasNextPage: false, hasPrevPage: false,
  });

  const pageRef = useRef(1);
  const filtersRef = useRef<FilterOptions>({});
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const triggerFetch = (page: number, filters: FilterOptions) => {
    pageRef.current = page;
    filtersRef.current = filters;
    setFetchTrigger(n => n + 1);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await getAllRequests({
          page: pageRef.current,
          limit: 10,
          status: filtersRef.current.status,
          category: filtersRef.current.category,
          priority: filtersRef.current.priority,
          search: filtersRef.current.search,
          startDate: filtersRef.current.startDate,
          endDate: filtersRef.current.endDate,
        });

        if (cancelled) return;
        if (response.success) {
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

    fetchRequests();
    return () => { cancelled = true; };
  }, [fetchTrigger]);

  const handlePageChange = (page: number) => {
    setPagination(p => ({ ...p, page }));
    triggerFetch(page, filtersRef.current);
  };

  const handleFilterChange = (filters: FilterOptions) => {
    setPagination(p => ({ ...p, page: 1 }));
    triggerFetch(1, filters);
  };

  const handleRefresh = () => {
    triggerFetch(pageRef.current, filtersRef.current);
  };

  const handleViewRequest = (requestId: string) => {
    navigate(`/admin/requests/${requestId}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header - Removed the duplicate refresh button */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            All Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all requests in the system
          </p>
        </div>
      </div>

      {/* RequestTable - Refresh button is inside the table */}
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
            onClick={() => handleViewRequest(request.id)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Manage
          </button>
        )}
      />
    </div>
  );
};

export default AdminRequests;