
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Send, 
  X, 
  Clock,
  AlertCircle
} from 'lucide-react';
import InputField from '../../../components/common/InputField'; 
import ConfirmDialog from '../../../components/common/Confirmdialog';
import { createRequest } from '../../../api/action/userAction';
import { type RequestCategory, type RequestPriority } from '../../../types/requestTypes';

const CreateRequest = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as RequestCategory,
    priority: 'medium' as RequestPriority,
  });
  const [errors, setErrors] = useState({
    title: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: '',
      description: '',
    };
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    } else if (!/^[a-zA-Z0-9\s\-_,.!?()]+$/.test(formData.title)) {
      newErrors.title = 'Title contains invalid characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must not exceed 5000 characters';
    } else if (!/^[a-zA-Z0-9\s\-_,.!?()\n\r]+$/.test(formData.description)) {
      newErrors.description = 'Description contains invalid characters';
    }
    
    setErrors(newErrors);
    return !newErrors.title && !newErrors.description;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowConfirm(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    
    try {
      const response = await createRequest({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
      });

      if (response.success) {
        toast.success('Request created successfully!');
        navigate('/myRequests');
      } else {
        toast.error(response.message || 'Failed to create request');
      }
    } catch (error: unknown) {
      console.error('Create request error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || 'Failed to create request. Please try again.');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to create request. Please try again.');
      } else {
        toast.error('Failed to create request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.title.trim() || formData.description.trim()) {
      setShowConfirm(false);
      navigate('/myRequests');
    } else {
      navigate('/myRequests');
    }
  };

  const categories = [
    { value: 'access', label: 'Access Request', icon: '🔑', color: 'bg-blue-100 text-blue-800' },
    { value: 'software', label: 'Software Request', icon: '💻', color: 'bg-green-100 text-green-800' },
    { value: 'hardware', label: 'Hardware Request', icon: '🖥️', color: 'bg-purple-100 text-purple-800' },
    { value: 'leave', label: 'Leave Request', icon: '🏖️', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'budget', label: 'Budget Request', icon: '💰', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'other', label: 'Other', icon: '📝', color: 'bg-gray-100 text-gray-800' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', icon: '🟢', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'medium', label: 'Medium', icon: '🟡', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: 'high', label: 'High', icon: '🟠', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { value: 'urgent', label: 'Urgent', icon: '🔴', color: 'text-red-600', bgColor: 'bg-red-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-xl">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Create New Request
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-14">
          Submit a new workflow request. Your manager will review and respond to your request.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
        {/* Title Field */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Request Details
          </h2>
          
          <div className="space-y-5">
            <div>
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
              {errors.title && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.title}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 5 characters, maximum 200 characters
              </p>
            </div>

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
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 20 characters, maximum 5000 characters. Be as specific as possible.
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
                  flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
                  ${formData.priority === pri.value 
                    ? `${pri.bgColor} border-current` 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }
                `}
              >
                <span className="text-lg">{pri.icon}</span>
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
                What happens next?
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Your request will be reviewed by your manager. You'll receive updates via email 
                and can track the status from your dashboard.
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
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirm}
        title="Confirm Submission"
        message="Are you sure you want to submit this request? Once submitted, it cannot be edited until reviewed."
        confirmLabel="Yes, Submit"
        cancelLabel="Cancel"
        variant="primary"
        loading={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default CreateRequest;