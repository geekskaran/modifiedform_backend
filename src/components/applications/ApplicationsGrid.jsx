import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Download,
  FileText,
  AlertCircle,
  MessageSquare,
  Send,
  X,
  Check,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

const ApplicationsGrid = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState(null);
  
  // Modals
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // Bulk Email State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Status Update State
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchStats();
    fetchTemplates();
  }, [currentPage, searchTerm, statusFilter]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = `https://test2.codevab.com/api/applications?page=${currentPage}&limit=20`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(data.pagination?.current || 1);
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Applications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://test2.codevab.com/api/applications/admin/stats', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('https://test2.codevab.com/api/email-templates?limit=100&status=active', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Templates fetch error:', err);
    }
  };

  const handleSelectApplication = (applicationId) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.applicationId));
    }
  };

  const handleStatusUpdate = async (applicationId, status, applicationRemarks) => {
    try {
      setUpdatingStatus(true);
      
      const updateData = { 
        status: status,
        remarks: applicationRemarks 
      };
      
      console.log('Updating application:', applicationId, 'with data:', updateData);
      
      const response = await fetch(`https://test2.codevab.com/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      console.log('Update response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Update response:', responseData);
        
        // Refresh both applications list and stats
        await fetchApplications();
        await fetchStats();
        
        setShowStatusModal(false);
        setSelectedApplication(null);
        setNewStatus('');
        setRemarks('');
        
        // Show success message
        alert('Status updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        setError(errorData.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      setError('Error updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleBulkEmail = async () => {
    if (!selectedTemplate || selectedApplications.length === 0) {
      setError('Please select a template and at least one application');
      return;
    }

    try {
      setSendingEmail(true);
      
      // First create bulk email campaign
      const createResponse = await fetch('https://test2.codevab.com/api/bulk-email/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          templateId: selectedTemplate,
          applicationIds: selectedApplications,
          adminId: 'admin',
          adminName: 'Admin User',
          notes: `Bulk email sent to ${selectedApplications.length} applications`,
          tags: ['bulk', 'admin-sent']
        })
      });

      if (createResponse.ok) {
        const createData = await createResponse.json();
        const emailId = createData.bulkEmail.emailId;
        
        // Then send the emails
        const sendResponse = await fetch(`https://test2.codevab.com/api/bulk-email/send/${emailId}`, {
          method: 'POST',
          headers: getAuthHeaders()
        });

        if (sendResponse.ok) {
          setShowBulkEmailModal(false);
          setSelectedApplications([]);
          setSelectedTemplate('');
          setEmailPreview('');
          alert(`Bulk email sent successfully to ${selectedApplications.length} applications!`);
        } else {
          const errorData = await sendResponse.json();
          setError(errorData.message || 'Failed to send emails');
        }
      } else {
        const errorData = await createResponse.json();
        setError(errorData.message || 'Failed to create email campaign');
      }
    } catch (err) {
      setError('Error sending bulk email');
      console.error('Bulk email error:', err);
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePreviewEmail = async () => {
    if (!selectedTemplate || selectedApplications.length === 0) {
      setError('Please select a template and at least one application');
      return;
    }

    try {
      // Get sample application for preview
      const sampleApp = applications.find(app => selectedApplications.includes(app.applicationId));
      
      const response = await fetch('https://test2.codevab.com/api/email-templates/preview', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          templateId: selectedTemplate,
          variables: {
            name: sampleApp.name,
            applicationId: sampleApp.applicationId,
            email: sampleApp.email,
            status: sampleApp.status
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEmailPreview(data.preview);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate preview');
      }
    } catch (err) {
      setError('Error generating preview');
      console.error('Preview error:', err);
    }
  };

  const downloadDocument = async (applicationId) => {
    try {
      const response = await fetch(`https://test2.codevab.com/api/applications/${applicationId}/publication-document`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `application-${applicationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download document');
      }
    } catch (err) {
      setError('Error downloading document');
      console.error('Download error:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
      under_review: { icon: Eye, color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
            <p className="text-gray-600">Review and manage submitted applications</p>
          </div>
          <button
            onClick={fetchApplications}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="text-lg font-bold text-yellow-800">{stats.submitted || 0}</div>
                  <div className="text-sm text-yellow-600">Submitted</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-lg font-bold text-blue-800">{stats.under_review || 0}</div>
                  <div className="text-sm text-blue-600">Under Review</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-lg font-bold text-green-800">{stats.approved || 0}</div>
                  <div className="text-sm text-green-600">Approved</div>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-lg font-bold text-red-800">{stats.rejected || 0}</div>
                  <div className="text-sm text-red-600">Rejected</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {selectedApplications.length} selected
              </span>
              <button
                onClick={() => setShowBulkEmailModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Send Email</span>
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(true);
                  setSelectedApplication({ applicationId: 'bulk' });
                }}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Update Status</span>
              </button>
            </div>
          )}
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

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedApplications.length === applications.length && applications.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.applicationId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.applicationId)}
                      onChange={() => handleSelectApplication(application.applicationId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{application.name}</div>
                      <div className="text-sm text-gray-500">{application.email}</div>
                      <div className="text-sm text-gray-500">{application.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-blue-600">{application.applicationId}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{formatDate(application.submissionTime)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {application.remarks ? (
                        <div className="text-sm text-gray-600" title={application.remarks}>
                          <div className="truncate max-w-32">{application.remarks}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {application.updatedAt ? formatDate(application.updatedAt) : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No remarks</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setNewStatus(application.status);
                          setRemarks(application.remarks || '');
                          setShowStatusModal(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Update Status"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {application.publicationDocument && (
                        <button
                          onClick={() => downloadDocument(application.applicationId)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Download Document"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
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
        )}
      </div>

      {/* Empty State */}
      {applications.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter 
              ? 'Try adjusting your filters or search terms.'
              : 'No applications have been submitted yet.'
            }
          </p>
        </div>
      )}

      {/* Bulk Email Modal */}
      {showBulkEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Send Bulk Email ({selectedApplications.length} recipients)
              </h3>
              <button
                onClick={() => {
                  setShowBulkEmailModal(false);
                  setSelectedTemplate('');
                  setEmailPreview('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Email Template *
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a template...</option>
                  {templates.map((template) => (
                    <option key={template.templateId} value={template.templateId}>
                      {template.name} ({template.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              {selectedTemplate && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Preview
                    </label>
                    <button
                      onClick={handlePreviewEmail}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Generate Preview
                    </button>
                  </div>
                  {emailPreview && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-auto">
                      <div dangerouslySetInnerHTML={{ __html: emailPreview }} />
                    </div>
                  )}
                </div>
              )}

              {/* Selected Applications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Applications ({selectedApplications.length})
                </label>
                <div className="max-h-32 overflow-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {selectedApplications.map((appId) => {
                    const app = applications.find(a => a.applicationId === appId);
                    return app ? (
                      <div key={appId} className="text-sm text-gray-600 mb-1">
                        {app.name} - {app.applicationId}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowBulkEmailModal(false);
                  setSelectedTemplate('');
                  setEmailPreview('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkEmail}
                disabled={!selectedTemplate || sendingEmail}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Status
                {selectedApplication.applicationId !== 'bulk' && (
                  <span className="block text-sm text-gray-500 mt-1">
                    {selectedApplication.applicationId}
                  </span>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedApplication(null);
                  setNewStatus('');
                  setRemarks('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks *
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add remarks for this status update..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Remarks are required when updating status
                </p>
              </div>

              {selectedApplication.applicationId === 'bulk' && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    This will update the status for {selectedApplications.length} selected applications.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedApplication(null);
                  setNewStatus('');
                  setRemarks('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedApplication.applicationId === 'bulk') {
                    // Handle bulk status update
                    selectedApplications.forEach(appId => {
                      handleStatusUpdate(appId, newStatus, remarks);
                    });
                  } else {
                    handleStatusUpdate(selectedApplication.applicationId, newStatus, remarks);
                  }
                }}
                disabled={!newStatus || !remarks.trim() || updatingStatus}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Update Status</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
{/* Application Details Modal - Enhanced Version */}
{showApplicationModal && selectedApplication && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-xl font-bold">Application Details</h3>
            <p className="text-blue-100 text-sm mt-1">
              ID: {selectedApplication.applicationId}
            </p>
          </div>
          <button
            onClick={() => {
              setShowApplicationModal(false);
              setSelectedApplication(null);
            }}
            className="text-white hover:text-blue-200 hover:bg-blue-800 p-2 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div className="p-6 overflow-auto max-h-[70vh]">
        {/* Status and Submission Info Bar */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Submitted:</span>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedApplication.submissionTime)}
                </p>
              </div>
            </div>
            {selectedApplication.updatedAt && (
              <div>
                <span className="text-sm text-gray-600">Last Updated:</span>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedApplication.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-lg">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold text-sm">P</span>
                </div>
                Personal Information
              </h4>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Full Name
                  </label>
                  <p className="text-lg font-medium text-gray-900">{selectedApplication.name}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Email Address
                    </label>
                    <p className="text-sm text-gray-900 break-all">{selectedApplication.email}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Phone Number
                    </label>
                    <p className="text-sm text-gray-900">{selectedApplication.phone}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Address
                  </label>
                  <p className="text-sm text-gray-900 leading-relaxed">{selectedApplication.address}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Category
                    </label>
                    <p className="text-sm text-gray-900">{selectedApplication.category}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Date of Birth
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedApplication.dateOfBirth ? 
                        new Date(selectedApplication.dateOfBirth).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-lg">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                Application Information
              </h4>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                  Application ID
                </label>
                <p className="text-lg font-mono font-bold text-blue-800">{selectedApplication.applicationId}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Qualifying Degree
                </label>
                <p className="text-sm text-gray-900">{selectedApplication.qualifyingDegree || 'N/A'}</p>
              </div>
              

              
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Current Remarks
                </label>
                <div className="bg-white rounded border p-3 min-h-[60px]">
                  {selectedApplication.remarks ? (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedApplication.remarks}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No remarks added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Publication Details Section */}
        {selectedApplication.publicationDetails && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-lg">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-indigo-600" />
                </div>
                Publication Details
              </h4>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
                <div className="prose prose-sm max-w-none">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {selectedApplication.publicationDetails}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Publication Info */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Document Status
                    </label>
                    <div className="flex items-center space-x-2">
                      {selectedApplication.publicationDocument ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-700 font-medium">Document Attached</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm text-orange-700 font-medium">No Document</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Content Length
                    </label>
                    <p className="text-sm text-gray-700">
                      {selectedApplication.publicationDetails.length} characters
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Educational Qualifications Section */}
        {selectedApplication.educationalQualifications && selectedApplication.educationalQualifications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-lg">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-semibold text-sm">E</span>
                </div>
                Educational Qualifications
              </h4>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">
                        Institute/University
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Examination
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Year of Passing
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-lg">
                        Marks %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedApplication.educationalQualifications.map((edu, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900">{edu.institute}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-700">{edu.examPassed}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-700">{edu.yearOfPassing}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {edu.marksPercentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Work Experience Section */}
        {selectedApplication.experience && selectedApplication.experience.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-lg">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-orange-600 font-semibold text-sm">W</span>
                </div>
                Work Experience
              </h4>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {selectedApplication.experience.map((exp, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Company
                        </label>
                        <p className="text-sm font-medium text-gray-900">{exp.companyName}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Duration
                        </label>
                        <p className="text-sm text-gray-700">
                          {exp.startDate} to {exp.isCurrentlyWorking ? 
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Present
                            </span> : exp.endDate}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Salary
                        </label>
                        <p className="text-sm font-medium text-gray-900">₹{exp.salary?.toLocaleString('en-IN') || exp.salary}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Status
                        </label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          exp.isCurrentlyWorking ? 
                          'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {exp.isCurrentlyWorking ? 'Currently Working' : 'Past Employment'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            {selectedApplication.publicationDocument && (
              <button
                onClick={() => downloadDocument(selectedApplication.applicationId)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Download Document</span>
              </button>
            )}
            <button
              onClick={() => {
                setShowApplicationModal(false);
                setSelectedApplication(selectedApplication);
                setNewStatus(selectedApplication.status);
                setRemarks(selectedApplication.remarks || '');
                setShowStatusModal(true);
              }}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Edit className="h-4 w-4" />
              <span>Update Status</span>
            </button>
          </div>
          <button
            onClick={() => {
              setShowApplicationModal(false);
              setSelectedApplication(null);
            }}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ApplicationsGrid;




// import React, { useState, useEffect } from 'react';
// import { 
//   Search, 
//   Filter, 
//   Eye, 
//   Edit, 
//   Mail, 
//   Users, 
//   AlertCircle, 
//   X, 
//   FileText,
//   Plus,
//   Template,
//   Send,
//   Save,
//   Clock
// } from 'lucide-react';
// import EmailTemplateComposer from '../template/EmailTemplateComposer';

// const ApplicationsGrid = () => {
//   // Existing state
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [selectedApplications, setSelectedApplications] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // Existing modals state
//   const [selectedApplication, setSelectedApplication] = useState(null);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [updatingStatus, setUpdatingStatus] = useState(false);
//   const [statusFormData, setStatusFormData] = useState({
//     status: '',
//     remarks: ''
//   });

//   // Enhanced email functionality state
//   const [showEmailOptionsModal, setShowEmailOptionsModal] = useState(false);
//   const [showTemplateComposer, setShowTemplateComposer] = useState(false);
//   const [showBulkEmailModal, setShowBulkEmailModal] = useState(false); // Keep existing
//   const [composerMode, setComposerMode] = useState('create'); // 'create', 'edit', 'compose'
//   const [selectedTemplate, setSelectedTemplate] = useState('');
//   const [availableTemplates, setAvailableTemplates] = useState([]);
//   const [loadingTemplates, setLoadingTemplates] = useState(false);
//   const [emailPreview, setEmailPreview] = useState('');
//   const [sendingEmail, setSendingEmail] = useState(false);

//   // Helper function for auth headers
//   const getAuthHeaders = () => {
//     const token = localStorage.getItem('token');
//     return {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`
//     };
//   };

//   // Existing functions (fetchApplications, handleSearch, etc.)
//   const fetchApplications = async () => {
//     try {
//       setLoading(true);
//       setError('');

//       const queryParams = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: '20',
//         ...(searchTerm && { search: searchTerm }),
//         ...(statusFilter && { status: statusFilter })
//       });

//       const response = await fetch(`https://test2.codevab.com/api/applications?${queryParams}`, {
//         headers: getAuthHeaders()
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setApplications(data.applications || []);
//         setTotalPages(data.pagination?.pages || 1);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || 'Failed to fetch applications');
//       }
//     } catch (err) {
//       setError('Error fetching applications');
//       console.error('Fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchTemplates = async () => {
//     try {
//       setLoadingTemplates(true);
//       const response = await fetch('https://test2.codevab.com/api/email-templates?limit=100', {
//         headers: getAuthHeaders()
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setAvailableTemplates(data.templates || []);
//       } else {
//         console.error('Failed to fetch templates');
//       }
//     } catch (err) {
//       console.error('Error fetching templates:', err);
//     } finally {
//       setLoadingTemplates(false);
//     }
//   };

//   useEffect(() => {
//     fetchApplications();
//   }, [currentPage, searchTerm, statusFilter]);

//   const handleSearch = (term) => {
//     setSearchTerm(term);
//     setCurrentPage(1);
//   };

//   const handleStatusFilterChange = (status) => {
//     setStatusFilter(status);
//     setCurrentPage(1);
//   };

//   const handleSelectApplication = (applicationId) => {
//     setSelectedApplications(prev => 
//       prev.includes(applicationId)
//         ? prev.filter(id => id !== applicationId)
//         : [...prev, applicationId]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedApplications.length === applications.length) {
//       setSelectedApplications([]);
//     } else {
//       setSelectedApplications(applications.map(app => app.applicationId));
//     }
//   };

//   // Enhanced Email Functions
//   const handleEmailButtonClick = () => {
//     if (selectedApplications.length === 0) {
//       setError('Please select at least one application');
//       return;
//     }
    
//     fetchTemplates();
//     setShowEmailOptionsModal(true);
//   };

//   const handleEmailOptionSelect = (option) => {
//     setShowEmailOptionsModal(false);
    
//     switch (option) {
//       case 'existing_template':
//         setShowBulkEmailModal(true); // Use existing modal for template selection
//         break;
//       case 'create_template':
//         setComposerMode('create');
//         setShowTemplateComposer(true);
//         break;
//       case 'compose_email':
//         setComposerMode('compose');
//         setShowTemplateComposer(true);
//         break;
//       default:
//         break;
//     }
//   };

//   const handleTemplateComposerSave = async (templateData) => {
//     try {
//       const endpoint = composerMode === 'create' 
//         ? 'https://test2.codevab.com/api/email-templates/drafts'
//         : 'https://test2.codevab.com/api/email-templates';

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           ...templateData,
//           isDraft: composerMode === 'create' || composerMode === 'compose'
//         })
//       });

//       if (response.ok) {
//         const data = await response.json();
        
//         if (composerMode === 'compose') {
//           // If in compose mode, proceed to send email immediately
//           await handleSendEmailWithTemplate(data.template.templateId);
//         } else {
//           // Show success message for saved draft
//           alert('Template saved as draft successfully!');
//         }
//       } else {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to save template');
//       }
//     } catch (err) {
//       throw err;
//     }
//   };

//   const handleSendEmailWithTemplate = async (templateId) => {
//     try {
//       setSendingEmail(true);
      
//       // First create bulk email campaign
//       const createResponse = await fetch('https://test2.codevab.com/api/bulk-email/create', {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           templateId: templateId,
//           applicationIds: selectedApplications,
//           adminId: 'admin',
//           adminName: 'Admin User',
//           notes: `Email sent to ${selectedApplications.length} applications using composer`,
//           tags: ['composer-sent', 'admin-sent']
//         })
//       });

//       if (createResponse.ok) {
//         const createData = await createResponse.json();
//         const emailId = createData.bulkEmail.emailId;
        
//         // Then send the emails
//         const sendResponse = await fetch(`https://test2.codevab.com/api/bulk-email/send/${emailId}`, {
//           method: 'POST',
//           headers: getAuthHeaders()
//         });

//         if (sendResponse.ok) {
//           setSelectedApplications([]);
//           setShowTemplateComposer(false);
//           alert(`Email sent successfully to ${selectedApplications.length} applications!`);
//         } else {
//           const errorData = await sendResponse.json();
//           throw new Error(errorData.message || 'Failed to send emails');
//         }
//       } else {
//         const errorData = await createResponse.json();
//         throw new Error(errorData.message || 'Failed to create email campaign');
//       }
//     } catch (err) {
//       setError(err.message || 'Error sending email');
//       console.error('Send email error:', err);
//     } finally {
//       setSendingEmail(false);
//     }
//   };

//   // Existing bulk email functions (keep for compatibility)
//   const handleBulkEmail = async () => {
//     if (!selectedTemplate || selectedApplications.length === 0) {
//       setError('Please select a template and at least one application');
//       return;
//     }

//     await handleSendEmailWithTemplate(selectedTemplate);
//     setShowBulkEmailModal(false);
//     setSelectedTemplate('');
//     setEmailPreview('');
//   };

//   const handlePreviewEmail = async () => {
//     if (!selectedTemplate || selectedApplications.length === 0) {
//       setError('Please select a template and at least one application');
//       return;
//     }

//     try {
//       // Get first selected application for preview
//       const firstAppId = selectedApplications[0];
//       const firstApp = applications.find(app => app.applicationId === firstAppId);
      
//       if (!firstApp) return;

//       const response = await fetch('https://test2.codevab.com/api/email-templates/preview', {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           templateId: selectedTemplate,
//           variables: {
//             name: firstApp.name,
//             applicationId: firstApp.applicationId,
//             email: firstApp.email,
//             status: firstApp.status,
//             submissionDate: new Date(firstApp.submissionTime).toLocaleDateString(),
//             adminName: 'Admin User'
//           }
//         })
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setEmailPreview(data.preview.htmlContent);
//       } else {
//         setError('Failed to generate preview');
//       }
//     } catch (err) {
//       setError('Error generating preview');
//       console.error('Preview error:', err);
//     }
//   };

//   // Existing status update functions
//   const handleStatusUpdate = async () => {
//     if (!statusFormData.status || !statusFormData.remarks.trim()) {
//       setError('Please select a status and enter remarks');
//       return;
//     }

//     try {
//       setUpdatingStatus(true);
      
//       if (selectedApplication.applicationId === 'bulk') {
//         // Bulk status update
//         const promises = selectedApplications.map(appId => 
//           fetch(`https://test2.codevab.com/api/applications/${appId}/status`, {
//             method: 'PUT',
//             headers: getAuthHeaders(),
//             body: JSON.stringify(statusFormData)
//           })
//         );
        
//         await Promise.all(promises);
//         setSelectedApplications([]);
//       } else {
//         // Single status update
//         const response = await fetch(`https://test2.codevab.com/api/applications/${selectedApplication.applicationId}/status`, {
//           method: 'PUT',
//           headers: getAuthHeaders(),
//           body: JSON.stringify(statusFormData)
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to update status');
//         }
//       }

//       setShowStatusModal(false);
//       setStatusFormData({ status: '', remarks: '' });
//       fetchApplications();
//       alert('Status updated successfully');
//     } catch (err) {
//       console.error('Status update error:', err);
//       setError('Error updating status');
//     } finally {
//       setUpdatingStatus(false);
//     }
//   };

//   const getSelectedApplicationsData = () => {
//     return applications.filter(app => selectedApplications.includes(app.applicationId));
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header and Filters - Keep existing */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">IIT Patna R&D Applications Dashboard</h1>
//           <p className="text-gray-600 mt-1">Manage and review submitted applications</p>
//         </div>
        
//         <div className="flex items-center space-x-3">
//           <div className="relative">
//             <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search applications..."
//               value={searchTerm}
//               onChange={(e) => handleSearch(e.target.value)}
//               className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
          
//           <select
//             value={statusFilter}
//             onChange={(e) => handleStatusFilterChange(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           >
//             <option value="">All Status</option>
//             <option value="submitted">Submitted</option>
//             <option value="under_review">Under Review</option>
//             <option value="approved">Approved</option>
//             <option value="rejected">Rejected</option>
//           </select>
//         </div>
//       </div>

//       {/* Bulk Actions - Enhanced */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//         <div className="flex items-center justify-between">
//           <div className="text-sm text-gray-600">
//             {applications.length} applications • {selectedApplications.length} selected
//           </div>
          
//           {selectedApplications.length > 0 && (
//             <div className="flex items-center space-x-3">
//               <span className="text-sm text-gray-600">
//                 {selectedApplications.length} selected
//               </span>
              
//               {/* Enhanced Email Button with Options */}
//               <button
//                 onClick={handleEmailButtonClick}
//                 className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Mail className="h-4 w-4" />
//                 <span>Send Email</span>
//               </button>
              
//               <button
//                 onClick={() => {
//                   setShowStatusModal(true);
//                   setSelectedApplication({ applicationId: 'bulk' });
//                 }}
//                 className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 <Edit className="h-4 w-4" />
//                 <span>Update Status</span>
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
//           <AlertCircle className="h-5 w-5 text-red-500" />
//           <span className="text-red-700">{error}</span>
//           <button
//             onClick={() => setError('')}
//             className="ml-auto text-red-500 hover:text-red-700"
//           >
//             ×
//           </button>
//         </div>
//       )}

//       {/* Applications Table - Keep existing structure */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left">
//                   <input
//                     type="checkbox"
//                     checked={selectedApplications.length === applications.length && applications.length > 0}
//                     onChange={handleSelectAll}
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Applicant
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Application ID
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Submitted
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Remarks
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {applications.map((application) => (
//                 <tr key={application.applicationId} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <input
//                       type="checkbox"
//                       checked={selectedApplications.includes(application.applicationId)}
//                       onChange={() => handleSelectApplication(application.applicationId)}
//                       className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                     />
//                   </td>
//                   <td className="px-6 py-4">
//                     <div>
//                       <div className="font-medium text-gray-900">{application.name}</div>
//                       <div className="text-sm text-gray-500">{application.email}</div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-900 font-mono">
//                     {application.applicationId}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                       application.status === 'approved' ? 'bg-green-100 text-green-800' :
//                       application.status === 'rejected' ? 'bg-red-100 text-red-800' :
//                       application.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-gray-100 text-gray-800'
//                     }`}>
//                       {application.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {new Date(application.submissionTime).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {application.remarks ? (
//                       <span className="truncate block max-w-xs" title={application.remarks}>
//                         {application.remarks}
//                       </span>
//                     ) : (
//                       <span className="text-gray-400">No remarks</span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 text-sm space-x-2">
//                     <button
//                       onClick={() => {
//                         setSelectedApplication(application);
//                         setShowStatusModal(true);
//                         setStatusFormData({
//                           status: application.status,
//                           remarks: application.remarks || ''
//                         });
//                       }}
//                       className="text-blue-600 hover:text-blue-800 font-medium"
//                     >
//                       Edit Status
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination - Keep existing */}
//         {totalPages > 1 && (
//           <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
//             <div className="flex items-center justify-between">
//               <div className="text-sm text-gray-700">
//                 Page {currentPage} of {totalPages}
//               </div>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                   disabled={currentPage === 1}
//                   className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Empty State */}
//       {applications.length === 0 && !loading && (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
//           <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
//           <p className="text-gray-600">
//             {searchTerm || statusFilter 
//               ? 'Try adjusting your filters or search terms.'
//               : 'No applications have been submitted yet.'
//             }
//           </p>
//         </div>
//       )}

//       {/* Enhanced Email Options Modal */}
//       {showEmailOptionsModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-lg w-full">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Choose Email Option
//               </h3>
//               <button
//                 onClick={() => setShowEmailOptionsModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <div className="p-6 space-y-4">
//               <p className="text-sm text-gray-600 mb-4">
//                 Sending email to {selectedApplications.length} selected applications
//               </p>
              
//               <div className="space-y-3">
//                 <button
//                   onClick={() => handleEmailOptionSelect('existing_template')}
//                   className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <Template className="h-6 w-6 text-blue-600" />
//                     <div>
//                       <h4 className="font-medium text-gray-900">Use Existing Template</h4>
//                       <p className="text-sm text-gray-600">Choose from your saved email templates</p>
//                     </div>
//                   </div>
//                 </button>
                
//                 <button
//                   onClick={() => handleEmailOptionSelect('create_template')}
//                   className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <Plus className="h-6 w-6 text-green-600" />
//                     <div>
//                       <h4 className="font-medium text-gray-900">Create New Template</h4>
//                       <p className="text-sm text-gray-600">Create a reusable template and save as draft</p>
//                     </div>
//                   </div>
//                 </button>
                
//                 <button
//                   onClick={() => handleEmailOptionSelect('compose_email')}
//                   className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <Mail className="h-6 w-6 text-purple-600" />
//                     <div>
//                       <h4 className="font-medium text-gray-900">Compose & Send</h4>
//                       <p className="text-sm text-gray-600">Write email now and send immediately</p>
//                     </div>
//                   </div>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Enhanced Email Template Composer */}
//       <EmailTemplateComposer
//         isOpen={showTemplateComposer}
//         onClose={() => setShowTemplateComposer(false)}
//         onSave={handleTemplateComposerSave}
//         selectedApplications={getSelectedApplicationsData()}
//         mode={composerMode}
//       />

//       {/* Existing Bulk Email Modal (Keep for compatibility) */}
//       {showBulkEmailModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Send Email Using Template ({selectedApplications.length} recipients)
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowBulkEmailModal(false);
//                   setSelectedTemplate('');
//                   setEmailPreview('');
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <div className="p-6 space-y-6">
//               {/* Template Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Email Template *
//                 </label>
//                 <select
//                   value={selectedTemplate}
//                   onChange={(e) => setSelectedTemplate(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Choose a template...</option>
//                   {availableTemplates.map((template) => (
//                     <option key={template.templateId} value={template.templateId}>
//                       {template.name} ({template.category})
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Preview Section */}
//               {emailPreview && (
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-700 mb-2">Email Preview</h4>
//                   <div 
//                     className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-auto"
//                     dangerouslySetInnerHTML={{ __html: emailPreview }}
//                   />
//                 </div>
//               )}

//               {/* Actions */}
//               <div className="flex items-center justify-between pt-4 border-t border-gray-200">
//                 <button
//                   onClick={handlePreviewEmail}
//                   disabled={!selectedTemplate}
//                   className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <Eye className="h-4 w-4" />
//                   <span>Preview</span>
//                 </button>
                
//                 <div className="flex items-center space-x-3">
//                   <button
//                     onClick={() => {
//                       setShowBulkEmailModal(false);
//                       setSelectedTemplate('');
//                       setEmailPreview('');
//                     }}
//                     className="px-4 py-2 text-gray-600 hover:text-gray-800"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleBulkEmail}
//                     disabled={!selectedTemplate || sendingEmail}
//                     className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <Send className="h-4 w-4" />
//                     <span>{sendingEmail ? 'Sending...' : 'Send Email'}</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Status Update Modal (Keep existing functionality) */}
//       {showStatusModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-md w-full">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {selectedApplication?.applicationId === 'bulk' ? 'Update Status (Bulk)' : 'Update Application Status'}
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowStatusModal(false);
//                   setStatusFormData({ status: '', remarks: '' });
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <div className="p-6 space-y-4">
//               {selectedApplication?.applicationId === 'bulk' && (
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                   <p className="text-sm text-blue-700">
//                     You are updating status for {selectedApplications.length} selected applications
//                   </p>
//                 </div>
//               )}
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   New Status *
//                 </label>
//                 <select
//                   value={statusFormData.status}
//                   onChange={(e) => setStatusFormData(prev => ({ ...prev, status: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Select Status</option>
//                   <option value="submitted">Submitted</option>
//                   <option value="under_review">Under Review</option>
//                   <option value="approved">Approved</option>
//                   <option value="rejected">Rejected</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Remarks *
//                 </label>
//                 <textarea
//                   value={statusFormData.remarks}
//                   onChange={(e) => setStatusFormData(prev => ({ ...prev, remarks: e.target.value }))}
//                   placeholder="Enter remarks for this status change..."
//                   rows="4"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
              
//               <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
//                 <button
//                   onClick={() => {
//                     setShowStatusModal(false);
//                     setStatusFormData({ status: '', remarks: '' });
//                   }}
//                   className="px-4 py-2 text-gray-600 hover:text-gray-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleStatusUpdate}
//                   disabled={updatingStatus || !statusFormData.status || !statusFormData.remarks.trim()}
//                   className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <Save className="h-4 w-4" />
//                   <span>{updatingStatus ? 'Updating...' : 'Update Status'}</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Loading Overlay */}
//       {loading && (
//         <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
//           <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//             <span className="text-gray-900">Loading applications...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ApplicationsGrid;