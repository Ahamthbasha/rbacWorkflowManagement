// components/common/RequestTable.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Clock, CheckCircle, XCircle, AlertCircle,
  Filter, Search, ChevronLeft, ChevronRight, RefreshCw, FileText
} from 'lucide-react';
import type { WorkflowRequest } from '../../types/requestTypes';

// Icon map for status badges
const STATUS_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock, CheckCircle, XCircle, AlertCircle,
};

interface FilterOptions {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Define the fallback status config type
interface StatusFallbackConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
}

interface PriorityFallbackConfig {
  color: string;
  label: string;
}

interface RequestTableProps {
  requests: WorkflowRequest[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
  onFilterChange?: (filters: FilterOptions) => void;
  showActions?: boolean;
  customAction?: (request: WorkflowRequest) => React.ReactNode;
  showSearch?: boolean;
  showFilterButton?: boolean;
  showStatusFilter?: boolean;
  showCategoryFilter?: boolean;
  showPriorityFilter?: boolean;
  title?: string;
}

const RequestTable: React.FC<RequestTableProps> = ({
  requests,
  loading,
  pagination,
  onPageChange,
  onRefresh,
  onFilterChange,
  showActions = true,
  customAction,
  showSearch = true,
  showFilterButton = true,
  showStatusFilter = true,
  showCategoryFilter = true,
  showPriorityFilter = true,
  title = "My Requests",
}) => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Color maps
  const statusColorMap: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const priorityColorMap: Record<string, string> = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  // Fallback configurations
  const fallbackStatusConfig: Record<string, StatusFallbackConfig> = {
    submitted: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Submitted' },
    pending: { icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Pending' },
    approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Approved' },
    rejected: { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Rejected' },
    clarification_needed: { icon: AlertCircle, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Clarification Needed' },
    closed: { icon: CheckCircle, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', label: 'Closed' },
    reopened: { icon: AlertCircle, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Reopened' },
    cancelled: { icon: XCircle, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Cancelled' },
  };

  const fallbackPriorityConfig: Record<string, PriorityFallbackConfig> = {
    low: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Low' },
    medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Urgent' },
  };

  // Use backend's pre-formatted status display
  const getStatusBadgeFromDisplay = (request: WorkflowRequest): React.ReactNode => {
    if (request.statusDisplay) {
      const { label, color, iconName } = request.statusDisplay;
      const Icon = STATUS_ICON_MAP[iconName] ?? Clock;
      const colorClass = statusColorMap[color] || statusColorMap.gray;
      
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          <Icon className="h-3 w-3 mr-1" />
          {label}
        </span>
      );
    }
    
    // Fallback for older data
    const fallback = fallbackStatusConfig[request.status] || fallbackStatusConfig.submitted;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fallback.color}`}>
        <fallback.icon className="h-3 w-3 mr-1" />
        {fallback.label}
      </span>
    );
  };

  // Use backend's pre-formatted priority display
  const getPriorityBadgeFromDisplay = (request: WorkflowRequest): React.ReactNode => {
    if (request.priorityDisplay) {
      const { label, color } = request.priorityDisplay;
      const colorClass = priorityColorMap[color] || priorityColorMap.yellow;
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {label}
        </span>
      );
    }
    
    // Fallback for older data
    const fallback = fallbackPriorityConfig[request.priority] || fallbackPriorityConfig.medium;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fallback.color}`}>
        {fallback.label}
      </span>
    );
  };

  // Use backend's pre-formatted category label
  const getCategoryBadge = (request: WorkflowRequest): React.ReactNode => {
    const categoryLabel = request.categoryLabel || request.category;
    const displayLabel = typeof categoryLabel === 'string' 
      ? categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1) 
      : categoryLabel;
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
        {displayLabel}
      </span>
    );
  };

  // Use backend's pre-formatted date
  const getFormattedDate = (request: WorkflowRequest): string => {
    return request.submittedAtFormatted || new Date(request.submittedAt).toLocaleDateString();
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSearch = () => onFilterChange?.(filters);

  const resetFilters = () => {
    setFilters({});
    onFilterChange?.({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">({pagination.total} total)</span>
          </div>
          <div className="flex items-center space-x-2">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
                />
              </div>
            )}
            
            {showFilterButton && onFilterChange && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border rounded-lg transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="h-4 w-4" />
              </button>
            )}
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {showFilterButton && showFilters && onFilterChange && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {showStatusFilter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  >
                    <option value="">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="clarification_needed">Clarification Needed</option>
                    <option value="closed">Closed</option>
                    <option value="reopened">Reopened</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
              
              {showCategoryFilter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  >
                    <option value="">All Categories</option>
                    <option value="access">Access</option>
                    <option value="software">Software</option>
                    <option value="hardware">Hardware</option>
                    <option value="leave">Leave</option>
                    <option value="budget">Budget</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}
              
              {showPriorityFilter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={filters.priority || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              )}
              
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No requests found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {hasActiveFilters ? 'Try adjusting your filters' : 'No requests available'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Request</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                {showActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{request.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getCategoryBadge(request)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadgeFromDisplay(request)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadgeFromDisplay(request)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getFormattedDate(request)}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {customAction ? (
                        customAction(request)
                      ) : (
                        <button
                          onClick={() => navigate(`/requests/${request.id}`)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestTable;
export type { FilterOptions };