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
      
      let url = `http://localhost:4000/api/applications?page=${currentPage}&limit=20`;
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
      const response = await fetch('http://localhost:4000/api/applications/admin/stats', {
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
      
      const response = await fetch(`http://localhost:4000/api/applications/${applicationId}/status`, {
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
      const response = await fetch(`http://localhost:4000/api/applications/${applicationId}/publication-document`, {
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
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Application Details
              </h3>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-sm text-gray-900">{selectedApplication.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedApplication.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedApplication.phone}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="text-sm text-gray-900">{selectedApplication.address}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="text-sm text-gray-900">{selectedApplication.category}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-sm text-gray-900">
                      {selectedApplication.dateOfBirth ? new Date(selectedApplication.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Application Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Application Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Application ID</label>
                    <p className="text-sm font-mono text-blue-600">{selectedApplication.applicationId}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedApplication.submissionTime)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Qualifying Degree</label>
                    <p className="text-sm text-gray-900">{selectedApplication.qualifyingDegree || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Remarks</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedApplication.remarks || 'No remarks added yet'}
                    </p>
                  </div>
                  
                  {selectedApplication.publicationDetails && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publication Details</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded max-h-32 overflow-auto">
                        {selectedApplication.publicationDetails}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Educational Qualifications */}
              {selectedApplication.educationalQualifications && selectedApplication.educationalQualifications.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Educational Qualifications</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Institute</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedApplication.educationalQualifications.map((edu, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{edu.institute}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{edu.examPassed}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{edu.yearOfPassing}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{edu.marksPercentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedApplication.experience && selectedApplication.experience.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Work Experience</h4>
                  <div className="space-y-3">
                    {selectedApplication.experience.map((exp, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Company</label>
                            <p className="text-sm text-gray-900">{exp.companyName}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Duration</label>
                            <p className="text-sm text-gray-900">
                              {exp.startDate} to {exp.isCurrentlyWorking ? 'Present' : exp.endDate}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Salary</label>
                            <p className="text-sm text-gray-900">₹{exp.salary}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500">Status</label>
                            <p className="text-sm text-gray-900">
                              {exp.isCurrentlyWorking ? 'Currently Working' : 'Past Employment'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
              <div className="flex space-x-3">
                {selectedApplication.publicationDocument && (
                  <button
                    onClick={() => downloadDocument(selectedApplication.applicationId)}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsGrid;