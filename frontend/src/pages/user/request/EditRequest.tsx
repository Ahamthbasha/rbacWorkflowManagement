// pages/user/request/EditRequest.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Save, 
  X, 
  Clock,
  AlertCircle,
  Send
} from 'lucide-react';
import InputField from '../../../components/common/InputField'; 
import { getRequestById, editRequest, resubmitRequest } from '../../../api/action/userAction';
import type { RequestCategory, RequestPriority, WorkflowRequest } from '../../../types/requestTypes';

const EditRequest = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as RequestCategory,
    priority: 'medium' as RequestPriority,
  });
  const [originalRequest, setOriginalRequest] = useState<WorkflowRequest | null>(null);

  // ✅ Fix: inline async IIFE inside useEffect to avoid setState-in-effect lint error.
  // useCallback was wrapping a function that called setState, which the
  // react-hooks/set-state-in-effect rule flags. Moving the logic inline and
  // using an IIFE keeps the async/await syntax while satisfying the rule.
  useEffect(() => {
    if (!requestId) return;

    (async () => {
      try {
        const response = await getRequestById(requestId);
        if (response.success && response.data) {
          setOriginalRequest(response.data);
          setFormData({
            title: response.data.title,
            description: response.data.description,
            category: response.data.category,
            priority: response.data.priority,
          });
        } else {
          toast.error('Failed to load request');
          navigate('/myRequests');
        }
      } catch (error) {
        console.error('Error fetching request:', error);
        toast.error('Failed to load request');
        navigate('/myRequests');
      } finally {
        setLoading(false);
      }
    })();
  }, [requestId, navigate]); // ✅ Stable deps only — no function reference needed

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Standalone async helper used by the Save button (not inside an effect).
  const refetchRequest = async () => {
    if (!requestId) return;
    try {
      const response = await getRequestById(requestId);
      if (response.success && response.data) {
        setOriginalRequest(response.data);
        setFormData({
          title: response.data.title,
          description: response.data.description,
          category: response.data.category,
          priority: response.data.priority,
        });
      }
    } catch (error) {
      console.error('Error re-fetching request:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (formData.description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await editRequest(requestId!, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
      });

      if (response.success) {
        toast.success('Changes saved successfully!');
        await refetchRequest(); // ✅ Called from an event handler, not an effect
      } else {
        toast.error(response.message || 'Failed to save changes');
      }
    } catch (error: unknown) {
      console.error('Edit request error:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!window.confirm('Are you sure you want to resubmit this request for review?')) {
      return;
    }

    setIsResubmitting(true);
    try {
      const response = await resubmitRequest(requestId!);
      if (response.success) {
        toast.success('Request resubmitted successfully!');
        navigate('/myRequests');
      } else {
        toast.error(response.message || 'Failed to resubmit request');
      }
    } catch (error: unknown) {
      console.error('Resubmit error:', error);
      toast.error('Failed to resubmit request. Please try again.');
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/myRequests');
    }
  };

  const categories = [
    { value: 'access', label: 'Access Request', icon: '🔑' },
    { value: 'software', label: 'Software Request', icon: '💻' },
    { value: 'hardware', label: 'Hardware Request', icon: '🖥️' },
    { value: 'leave', label: 'Leave Request', icon: '🏖️' },
    { value: 'budget', label: 'Budget Request', icon: '💰' },
    { value: 'other', label: 'Other', icon: '📝' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-xl">
            <FileText className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Edit Rejected Request
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-14">
          Your request was rejected. Please review the feedback, make necessary changes, and resubmit.
        </p>
      </div>

      {/* Rejection Info Box */}
      {originalRequest?.comments && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-900 dark:text-red-300">
                Rejection Reason
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {originalRequest.comments}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Title Field */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Edit Request Details
          </h2>
          
          <div className="space-y-5">
            <InputField
              label="Request Title"
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Database Access Request, New Laptop, etc."
              value={formData.title}
              onChange={handleChange}
              required
              icon={<FileText className="h-4 w-4 text-gray-400" />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Please provide detailed information about your request..."
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 10 characters. Be as specific as possible.
              </p>
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value as RequestCategory })}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
                  ${formData.category === cat.value 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }
                `}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Priority Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {priorities.map((pri) => (
              <button
                key={pri.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: pri.value as RequestPriority })}
                className={`
                  flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200
                  ${formData.priority === pri.value 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }
                `}
              >
                <span className={`text-sm font-medium ${formData.priority === pri.value ? pri.color : 'text-gray-700 dark:text-gray-300'}`}>
                  {pri.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                What happens after resubmission?
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                After resubmitting, your request will go back to your manager for review.
                You can track the status from your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveEdit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleResubmit}
            disabled={isResubmitting}
            className="flex-1 flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isResubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resubmitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Resubmit for Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRequest;