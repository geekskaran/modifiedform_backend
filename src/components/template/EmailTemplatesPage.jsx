import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Mail, 
  Calendar, 
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  MoreVertical
} from 'lucide-react';

const EmailTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'success', label: 'Success/Approval' },
    { value: 'interview', label: 'Interview' },
    { value: 'rejection', label: 'Rejection' },
    { value: 'general', label: 'General' },
    { value: 'followup', label: 'Follow-up' },
    { value: 'reminder', label: 'Reminder' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortOrder, currentPage]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { active: statusFilter === 'active' ? 'true' : 'false' }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`http://localhost:4000/api/email-templates?${params}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalTemplates(data.pagination?.total || 0);
      } else {
        setError('Failed to fetch templates');
      }
    } catch (err) {
      setError('Connection error. Please check your server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/email-templates/${templateId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await fetchTemplates();
        setShowDeleteModal(false);
        setSelectedTemplate(null);
      } else {
        setError('Failed to delete template');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      const duplicateData = {
        name: `${template.name} (Copy)`,
        category: template.category,
        subject: template.subject,
        htmlContent: template.htmlContent,
        variables: template.variables,
        metadata: {
          ...template.metadata,
          description: `Copy of ${template.name}`
        }
      };

      const response = await fetch('http://localhost:4000/api/email-templates', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(duplicateData)
      });

      if (response.ok) {
        await fetchTemplates();
      } else {
        setError('Failed to duplicate template');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryBadge = (category) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      interview: 'bg-blue-100 text-blue-800',
      rejection: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800',
      followup: 'bg-yellow-100 text-yellow-800',
      reminder: 'bg-purple-100 text-purple-800'
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const TemplateCard = ({ template }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {template.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs ${getCategoryBadge(template.category)}`}>
              {categories.find(c => c.value === template.category)?.label || template.category}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === template.templateId ? null : template.templateId)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {activeDropdown === template.templateId && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    navigateTo(`/admin/templates/edit/${template.templateId}`);
                    setActiveDropdown(null);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </button>
                <button
                  onClick={() => {
                    navigateTo(`/admin/templates/preview/${template.templateId}`);
                    setActiveDropdown(null);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </button>
                <button
                  onClick={() => {
                    handleDuplicateTemplate(template);
                    setActiveDropdown(null);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowDeleteModal(true);
                    setActiveDropdown(null);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 mb-1">Subject:</p>
        <p className="text-sm text-gray-900 line-clamp-2">{template.subject}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Mail className="h-4 w-4" />
            <span>{template.usageCount || 0} sent</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(template.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {template.isDraft && (
            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
              Draft
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs ${
            template.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {template.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Tags */}
      {template.metadata?.tags && template.metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {template.metadata.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
          {template.metadata.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{template.metadata.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (loading && templates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
            <p className="text-gray-600 mt-2">
              Create and manage email templates for different scenarios
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchTemplates}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => navigateTo('/admin/templates/create')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="updatedAt-desc">Latest Updated</option>
              <option value="createdAt-desc">Latest Created</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="usageCount-desc">Most Used</option>
            </select>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {templates.length} of {totalTemplates} template{totalTemplates !== 1 ? 's' : ''}
            </div>
            <div>
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 mb-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {templates.map((template) => (
              <TemplateCard key={template.templateId} template={template} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || categoryFilter || statusFilter !== 'active'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first email template.'
              }
            </p>
            <button
              onClick={() => navigateTo('/admin/templates/create')}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Template</span>
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Template</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the template <strong>"{selectedTemplate.name}"</strong>? 
              This will permanently remove the template and all its data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTemplate(selectedTemplate.templateId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplatesPage;