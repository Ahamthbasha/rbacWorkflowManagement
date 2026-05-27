// pages/manager/requests/PendingRequests.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RefreshCw, Clock } from 'lucide-react';
import RequestTable from '../../../components/common/RequestTable';
import type { WorkflowRequest } from '../../../types/requestTypes';
import { getPendingRequests } from '../../../api/action/managerAction';

const PendingRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
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
        const response = await getPendingRequests({ 
          page, 
          limit: 10,
        });
        if (!cancelled && response.success) {
          setRequests(response.data);
          setPagination(response.pagination);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching pending requests:', error);
          toast.error('Failed to load pending requests');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [page, refreshKey]);

  const handlePageChange = (newPage: number) => setPage(newPage);
  
  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Pending Requests
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Requests awaiting your review and action
              </p>
            </div>
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
        // No onRefresh prop - remove redundant refresh button
        showActions={true}
        showSearch={false}
        showFilterButton={false}
        customAction={(request: WorkflowRequest) => (
          <button
            onClick={() => navigate(`/manager/requests/${request.id}`)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            <Clock className="h-4 w-4 mr-1" />
            Review & Action
          </button>
        )}
      />
    </div>
  );
};

export default PendingRequests;