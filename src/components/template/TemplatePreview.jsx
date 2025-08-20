import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  Edit, 
  Copy, 
  Download, 
  Send,
  AlertCircle,
  CheckCircle,
  FileText,
  Mail,
  User,
  Calendar,
  Hash,
  Sparkles,
  Code,
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const TemplatePreview = () => {
  const { id } = useParams();
  
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sampleData, setSampleData] = useState({
    name: 'John Doe',
    applicationId: 'RND1234567890',
    status: 'approved',
    email: 'john.doe@example.com',
    phone: '+91 9876543210'
  });
  const [showRawHtml, setShowRawHtml] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  useEffect(() => {
    if (template) {
      generatePreview();
    }
  }, [template, sampleData]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`https://test2.codevab.com/api/email-templates/${id}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setTemplate(data.template);
      } else if (response.status === 404) {
        setError('Template not found');
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch template');
      }
    } catch (err) {
      setError('Error loading template');
      console.error('Template fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!template) return;

    try {
      setPreviewLoading(true);
      
      const response = await fetch('https://test2.codevab.com/api/email-templates/preview', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          templateId: template.templateId,
          variables: sampleData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.preview);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate preview');
      }
    } catch (err) {
      setError('Error generating preview');
      console.error('Preview error:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCopyTemplate = async () => {
    try {
      setCopying(true);
      
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

      const response = await fetch('https://test2.codevab.com/api/email-templates', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(duplicateData)
      });

      if (response.ok) {
        alert('Template duplicated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to duplicate template');
      }
    } catch (err) {
      setError('Error duplicating template');
      console.error('Duplicate error:', err);
    } finally {
      setCopying(false);
    }
  };

  const downloadAsHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${template.subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        ${previewData}
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'interview':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'rejection':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/admin/templates"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Template not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/templates"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {getCategoryIcon(template.category)}
                <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  template.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <p className="text-gray-600">{template.metadata?.description || 'No description available'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRawHtml(!showRawHtml)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Code className="h-4 w-4" />
              <span>{showRawHtml ? 'Preview' : 'View HTML'}</span>
            </button>
            
            <button
              onClick={downloadAsHtml}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            
            <button
              onClick={handleCopyTemplate}
              disabled={copying}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {copying ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>Duplicate</span>
            </button>
            
            <Link
              to={`/admin/templates/edit/${template.templateId}`}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Template</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template Details Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Template ID</label>
                <p className="text-sm font-mono text-blue-600">{template.templateId}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getCategoryIcon(template.category)}
                  <span className="text-sm text-gray-900 capitalize">{template.category}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900">{formatDate(template.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDate(template.updatedAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Usage Count</label>
                <p className="text-sm text-gray-900">{template.usageCount || 0} times</p>
              </div>
            </div>
          </div>

          {/* Sample Data Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sample Data</h3>
              <button
                onClick={generatePreview}
                disabled={previewLoading}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Refresh Preview"
              >
                <RefreshCw className={`h-4 w-4 ${previewLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={sampleData.name}
                  onChange={(e) => setSampleData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Application ID</label>
                <input
                  type="text"
                  value={sampleData.applicationId}
                  onChange={(e) => setSampleData(prev => ({ ...prev, applicationId: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={sampleData.status}
                  onChange={(e) => setSampleData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="interview">Interview</option>
                  <option value="under_review">Under Review</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={sampleData.email}
                  onChange={(e) => setSampleData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Variables Used */}
          {template.variables && template.variables.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Variables Used</h3>
              <div className="space-y-2">
                {template.variables.map((variable, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-3 w-3 text-gray-400" />
                      <span className="font-mono text-xs text-blue-600">{`{${variable.name}}`}</span>
                    </div>
                    {variable.description && (
                      <p className="text-xs text-gray-500 mt-1">{variable.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {template.metadata?.tags && template.metadata.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Preview Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showRawHtml ? 'HTML Source' : 'Email Preview'}
                </h3>
                <div className="flex items-center space-x-2">
                  {previewLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  <span className="text-sm text-gray-500">
                    {showRawHtml ? 'Raw HTML' : 'Rendered View'}
                  </span>
                </div>
              </div>
              
              {/* Subject Line */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line:</label>
                <p className="text-sm text-gray-900">{template.subject}</p>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6">
              {showRawHtml ? (
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {template.htmlContent}
                  </pre>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg bg-white">
                  {previewLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Generating preview...</p>
                      </div>
                    </div>
                  ) : previewData ? (
                    <div 
                      className="p-6 prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: previewData }}
                    />
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No preview available</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Template: {template.name} | Category: {template.category}
                </span>
                <span>
                  Last updated: {formatDate(template.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;