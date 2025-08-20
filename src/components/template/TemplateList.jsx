import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Mail,
  FileText,
  Calendar,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

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
      setError('');
      
      let url = `http://localhost:4000/api/email-templates?page=${currentPage}&limit=20`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      if (statusFilter) {
        if (statusFilter === 'active') url += `&status=active`;
        if (statusFilter === 'inactive') url += `&status=inactive`;
        if (statusFilter === 'draft') url += `&draft=true`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(data.pagination?.current || 1);
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch templates');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Templates fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/email-templates/utils/categories', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTemplates();
    setRefreshing(false);
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setDeleting(true);
      const response = await fetch(`http://localhost:4000/api/email-templates/${selectedTemplate.templateId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setTemplates(templates.filter(t => t.templateId !== selectedTemplate.templateId));
        setShowDeleteModal(false);
        setSelectedTemplate(null);
        alert('Template deleted successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete template');
      }
    } catch (err) {
      setError('Error deleting template');
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      const duplicateData = {
        name: `${template.name} (Copy)`,
        category: template.category,
        subject: template.subject,
        htmlContent: template.htmlContent,
        variables: template.variables || [],
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
        fetchTemplates(); // Refresh the list
        alert('Template duplicated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to duplicate template');
      }
    } catch (err) {
      setError('Error duplicating template');
      console.error('Duplicate error:', err);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'interview':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'rejection':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const TemplateCard = ({ template }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getCategoryIcon(template.category)}
            <div>
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-500">{getCategoryLabel(template.category)}</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <Link
                    to={`/admin/templates/edit/${template.templateId}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowActions(false)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Template
                  </Link>
                  <Link
                    to={`/admin/templates/preview/${template.templateId}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowActions(false)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Link>
                  <button
                    onClick={() => {
                      handleDuplicateTemplate(template);
                      setShowActions(false);
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
                      setShowActions(false);
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

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 mb-1">Subject:</p>
          <p className="text-sm text-gray-600 line-clamp-2">{template.subject}</p>
        </div>

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

        <div className="flex space-x-2">
          <Link
            to={`/admin/templates/edit/${template.templateId}`}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors text-center"
          >
            Edit Template
          </Link>
          <Link
            to={`/admin/templates/preview/${template.templateId}`}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDuplicateTemplate(template)}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
            <p className="text-gray-600">Manage your email templates for different scenarios</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/admin/templates/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Template</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
            <option value="">All Categories</option>
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
            <option value="draft">Draft</option>
          </select>

          {/* Results Info */}
          <div className="flex items-center text-sm text-gray-600">
            {templates.length} template{templates.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard key={template.templateId} template={template} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter || statusFilter 
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first email template.'
            }
          </p>
          <Link
            to="/admin/templates/create"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your First Template</span>
          </Link>
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

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTemplate(null);
                }}
                disabled={deleting}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateList;