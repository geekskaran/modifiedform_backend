import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileText,
  Code,
  Type,
  Mail,
  User,
  Calendar,
  Hash,
  Sparkles
} from 'lucide-react';

const TemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subject: '',
    htmlContent: '',
    variables: [],
    metadata: {
      description: '',
      tags: []
    }
  });

  const [categories, setCategories] = useState([]);
  const [standardVariables, setStandardVariables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState({
    name: '',
    description: '',
    defaultValue: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchStandardVariables();
    if (isEdit) {
      fetchTemplate();
    }
  }, [id, isEdit]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
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

  const fetchStandardVariables = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/email-templates/utils/variables', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setStandardVariables(data.variables || []);
      }
    } catch (err) {
      console.error('Variables fetch error:', err);
    }
  };

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/email-templates/${id}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        const template = data.template;
        setFormData({
          name: template.name || '',
          category: template.category || '',
          subject: template.subject || '',
          htmlContent: template.htmlContent || '',
          variables: template.variables || [],
          metadata: {
            description: template.metadata?.description || '',
            tags: template.metadata?.tags || []
          }
        });
        setIsDraft(template.isDraft || false);
      } else if (response.status === 404) {
        setError('Template not found');
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleMetadataChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.metadata.tags.includes(newTag.trim())) {
      handleMetadataChange('tags', [...formData.metadata.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    handleMetadataChange('tags', formData.metadata.tags.filter(tag => tag !== tagToRemove));
  };

  const addCustomVariable = () => {
    if (newVariable.name.trim()) {
      const variable = {
        name: newVariable.name.trim(),
        description: newVariable.description.trim(),
        defaultValue: newVariable.defaultValue.trim(),
        isCustom: true
      };

      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, variable]
      }));

      setNewVariable({ name: '', description: '', defaultValue: '' });
    }
  };

  const removeVariable = (index) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const insertVariable = (variableName) => {
    const textarea = document.getElementById('htmlContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newContent = before + `{{${variableName}}}` + after;

    handleInputChange('htmlContent', newContent);

    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableName.length + 4, start + variableName.length + 4);
    }, 10);
  };

  const handlePreview = async () => {
    if (!formData.htmlContent.trim()) {
      setError('Please add content to preview');
      return;
    }

    try {
      setPreviewLoading(true);
      const sampleData = {
        name: 'John Doe',
        applicationId: 'RND1234567890',
        status: 'approved',
        email: 'john.doe@example.com'
      };

      const response = await fetch('http://localhost:4000/api/email-templates/preview', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          htmlContent: formData.htmlContent,
          subject: formData.subject,
          variables: sampleData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.preview);
        setShowPreview(true);
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Template name is required');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('Subject line is required');
      return false;
    }
    if (!formData.htmlContent.trim()) {
      setError('Email content is required');
      return false;
    }
    return true;
  };

  const handleSave = async (asDraft = false) => {
    if (!asDraft && !validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const endpoint = isEdit
        ? `http://localhost:4000/api/email-templates/${id}`
        : asDraft
          ? 'http://localhost:4000/api/email-templates/drafts'
          : 'http://localhost:4000/api/email-templates';

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(asDraft ? 'Draft saved successfully!' : 'Template saved successfully!');

        if (!isEdit) {
          // Redirect to edit mode after creation
          setTimeout(() => {
            navigate(`/admin/templates/edit/${data.template.templateId}`);
          }, 1500);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save template');
      }
    } catch (err) {
      setError('Error saving template');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishDraft = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const response = await fetch(`http://localhost:4000/api/email-templates/drafts/${id}/publish`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subject: formData.subject,
          htmlContent: formData.htmlContent
        })
      });

      if (response.ok) {
        setSuccess('Template published successfully!');
        setIsDraft(false);
        setTimeout(() => {
          navigate('/admin/templates');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to publish template');
      }
    } catch (err) {
      setError('Error publishing template');
      console.error('Publish error:', err);
    } finally {
      setSaving(false);
    }
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
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Template' : 'Create New Template'}
                {isDraft && <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Draft</span>}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Modify your existing email template' : 'Create a new email template for your campaigns'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreview}
              disabled={previewLoading || !formData.htmlContent.trim()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {previewLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span>Preview</span>
            </button>

            {!isDraft && (
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <FileText className="h-4 w-4" />
                <span>Save as Draft</span>
              </button>
            )}

            {isDraft ? (
              <button
                onClick={handlePublishDraft}
                disabled={saving}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>Publish Template</span>
              </button>
            ) : (
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Template</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
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

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Application Approval Template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="e.g., Congratulations! Your Application {{applicationId}} has been Approved"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {{ variableName }} for dynamic content
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.metadata.description}
                  onChange={(e) => handleMetadataChange('description', e.target.value)}
                  placeholder="Brief description of this template's purpose"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Email Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Content *</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Code className="h-4 w-4" />
                <span>HTML Supported</span>
              </div>
            </div>

            <div>
              <textarea
                id="htmlContent"
                value={formData.htmlContent}
                onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                placeholder="Enter your email content here. Use HTML for formatting and {{variableName}} for dynamic content."
                rows="12"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Use HTML tags for formatting. Variables like {{ name }}, {{ applicationId }} will be replaced with actual values.
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>

            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {formData.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.metadata.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Standard Variables */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Variables</h3>

            <div className="space-y-2">
              {standardVariables.map((variable) => (
                <button
                  key={variable.name}
                  onClick={() => insertVariable(variable.name)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <span className="font-mono text-sm text-blue-600">{{ variable.name}}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{variable.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Variables */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Variables</h3>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Variable name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newVariable.description}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newVariable.defaultValue}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
                  placeholder="Default value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={addCustomVariable}
                disabled={!newVariable.name.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                <span>Add Variable</span>
              </button>
            </div>

            {/* Custom Variables List */}
            {formData.variables.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Added Variables:</h4>
                {formData.variables.map((variable, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-mono text-sm text-blue-600">{{ variable.name }}</span>
                      {variable.description && (
                        <p className="text-xs text-gray-500">{variable.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeVariable(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

            <div className="space-y-2">
              <button
                onClick={() => insertVariable('name')}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Insert Name</span>
              </button>
              <button
                onClick={() => insertVariable('applicationId')}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Insert Application ID</span>
              </button>
              <button
                onClick={() => insertVariable('email')}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Insert Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Subject:</h4>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{formData.subject}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Content:</h4>
                <div
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: previewData }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateForm;