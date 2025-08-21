import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Trash2,
  BarChart3,
  FileText,
  Download,
  RotateCcw,
  Play,
  Pause,
  X,
  TrendingUp,
  Activity
} from 'lucide-react';

const BulkEmailManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  
  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  
  // Actions
  const [retrying, setRetrying] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, templateFilter]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = `https://test2.codevab.com/api/bulk-email?page=${currentPage}&limit=20`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (templateFilter) url += `&templateId=${templateFilter}`;

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.bulkEmails || []);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(data.pagination?.current || 1);
      } else if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch campaigns');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Campaigns fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://test2.codevab.com/api/bulk-email/stats/overview', {
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

  const fetchRecipients = async (campaignId, status = '') => {
    try {
      setRecipientsLoading(true);
      
      let url = `https://test2.codevab.com/api/bulk-email/${campaignId}/recipients?page=1&limit=100`;
      if (status) url += `&status=${status}`;

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setRecipients(data.recipients || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch recipients');
      }
    } catch (err) {
      setError('Error fetching recipients');
      console.error('Recipients fetch error:', err);
    } finally {
      setRecipientsLoading(false);
    }
  };

  const handleRetryCampaign = async (campaignId) => {
    try {
      setRetrying(campaignId);
      
      const response = await fetch(`https://test2.codevab.com/api/bulk-email/${campaignId}/retry`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        fetchCampaigns(); // Refresh the list
        alert('Retry initiated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to retry campaign');
      }
    } catch (err) {
      setError('Error retrying campaign');
      console.error('Retry error:', err);
    } finally {
      setRetrying(null);
    }
  };

  const handleCancelCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return;

    try {
      setCancelling(campaignId);
      
      const response = await fetch(`https://test2.codevab.com/api/bulk-email/${campaignId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        fetchCampaigns(); // Refresh the list
        alert('Campaign cancelled successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to cancel campaign');
      }
    } catch (err) {
      setError('Error cancelling campaign');
      console.error('Cancel error:', err);
    } finally {
      setCancelling(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      sending: { icon: Send, color: 'bg-blue-100 text-blue-800', label: 'Sending' },
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Failed' },
      cancelled: { icon: X, color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
      partial: { icon: AlertCircle, color: 'bg-orange-100 text-orange-800', label: 'Partial' }
    };

    const config = statusConfig[status] || statusConfig.pending;
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

  const getSuccessRate = (campaign) => {
    if (!campaign.statistics || campaign.statistics.totalRecipients === 0) return 0;
    return Math.round((campaign.statistics.successCount / campaign.statistics.totalRecipients) * 100);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600'
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">{trend}</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Bulk Email Management</h1>
            <p className="text-gray-600">Monitor and manage your email campaigns</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchCampaigns}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <Link
              to="/admin/applications"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>Create Campaign</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Campaigns"
              value={stats.totalCampaigns || 0}
              icon={Mail}
              color="blue"
              subtitle="All time"
            />
            <StatCard
              title="Total Recipients"
              value={stats.totalRecipients || 0}
              icon={Users}
              color="green"
              subtitle="Emails sent"
            />
            <StatCard
              title="Success Rate"
              value={stats.totalRecipients > 0 ? `${Math.round((stats.totalSuccess / stats.totalRecipients) * 100)}%` : '0%'}
              icon={CheckCircle}
              color="green"
              subtitle="Delivery success"
            />
            <StatCard
              title="Failed Emails"
              value={stats.totalFailures || 0}
              icon={XCircle}
              color="red"
              subtitle="Need retry"
            />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="sending">Sending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="partial">Partial</option>
          </select>

          <select
            value={templateFilter}
            onChange={(e) => setTemplateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Templates</option>
            <option value="success">Success Templates</option>
            <option value="interview">Interview Templates</option>
            <option value="rejection">Rejection Templates</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} found
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

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.emailId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Campaign #{campaign.emailId.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        by {campaign.adminName || 'Admin'}
                      </div>
                      {campaign.notes && (
                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                          {campaign.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {campaign.templateUsed?.templateName || 'Unknown Template'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {campaign.templateUsed?.templateCategory || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {campaign.statistics?.totalRecipients || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-green-600">{campaign.statistics?.successCount || 0} sent</span>
                      {campaign.statistics?.failureCount > 0 && (
                        <span className="text-red-600 ml-2">{campaign.statistics.failureCount} failed</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(campaign.emailStatus)}
                    {campaign.progress && campaign.emailStatus === 'sending' && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${campaign.progress.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {campaign.progress.percentage}% complete
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {getSuccessRate(campaign)}%
                      </div>
                      <div className="ml-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              getSuccessRate(campaign) >= 90 ? 'bg-green-500' :
                              getSuccessRate(campaign) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${getSuccessRate(campaign)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(campaign.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          fetchRecipients(campaign.emailId);
                          setShowRecipientsModal(true);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Recipients"
                      >
                        <Users className="h-4 w-4" />
                      </button>

                      {campaign.statistics?.failureCount > 0 && (
                        <button
                          onClick={() => handleRetryCampaign(campaign.emailId)}
                          disabled={retrying === campaign.emailId}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Retry Failed"
                        >
                          {retrying === campaign.emailId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      {campaign.emailStatus === 'sending' && (
                        <button
                          onClick={() => handleCancelCampaign(campaign.emailId)}
                          disabled={cancelling === campaign.emailId}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Cancel Campaign"
                        >
                          {cancelling === campaign.emailId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <X className="h-4 w-4" />
                          )}
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
      {campaigns.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No email campaigns found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter || templateFilter 
              ? 'Try adjusting your filters.'
              : 'Start by creating your first email campaign.'
            }
          </p>
          <Link
            to="/admin/applications"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Send className="h-5 w-5" />
            <span>Create First Campaign</span>
          </Link>
        </div>
      )}

      {/* Campaign Details Modal */}
      {showDetailsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Campaign Details - #{selectedCampaign.emailId.slice(-8)}
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCampaign(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campaign Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Campaign Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Campaign ID</label>
                    <p className="text-sm font-mono text-blue-600">{selectedCampaign.emailId}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedCampaign.emailStatus)}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created By</label>
                    <p className="text-sm text-gray-900">{selectedCampaign.adminName || 'Admin'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedCampaign.createdAt)}</p>
                  </div>
                  
                  {selectedCampaign.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedCampaign.notes}</p>
                    </div>
                  )}
                  
                  {selectedCampaign.tags && selectedCampaign.tags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tags</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCampaign.tags.map((tag, index) => (
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

                {/* Template & Statistics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Template & Statistics</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Template Used</label>
                    <p className="text-sm text-gray-900">{selectedCampaign.templateUsed?.templateName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{selectedCampaign.templateUsed?.templateCategory || 'N/A'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-blue-800">
                        {selectedCampaign.statistics?.totalRecipients || 0}
                      </div>
                      <div className="text-sm text-blue-600">Total Recipients</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-green-800">
                        {selectedCampaign.statistics?.successCount || 0}
                      </div>
                      <div className="text-sm text-green-600">Successful</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-red-800">
                        {selectedCampaign.statistics?.failureCount || 0}
                      </div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-yellow-800">
                        {selectedCampaign.statistics?.pendingCount || 0}
                      </div>
                      <div className="text-sm text-yellow-600">Pending</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Success Rate</label>
                    <div className="flex items-center mt-1">
                      <div className="text-lg font-bold text-gray-900 mr-2">
                        {getSuccessRate(selectedCampaign)}%
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            getSuccessRate(selectedCampaign) >= 90 ? 'bg-green-500' :
                            getSuccessRate(selectedCampaign) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${getSuccessRate(selectedCampaign)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {selectedCampaign.progress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Progress</label>
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Completed: {selectedCampaign.progress.completed}</span>
                          <span>Pending: {selectedCampaign.progress.pending}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${selectedCampaign.progress.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {selectedCampaign.progress.percentage}% complete
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              {selectedCampaign.timeline && selectedCampaign.timeline.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Campaign Timeline</h4>
                  <div className="space-y-3">
                    {selectedCampaign.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{event.action}</div>
                          <div className="text-xs text-gray-500">{formatDate(event.timestamp)}</div>
                          {event.details && (
                            <div className="text-xs text-gray-600 mt-1">{event.details}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    fetchRecipients(selectedCampaign.emailId);
                    setShowRecipientsModal(true);
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>View Recipients</span>
                </button>
                
                {selectedCampaign.statistics?.failureCount > 0 && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleRetryCampaign(selectedCampaign.emailId);
                    }}
                    className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Retry Failed</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCampaign(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipients Modal */}
      {showRecipientsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Campaign Recipients - #{selectedCampaign.emailId.slice(-8)}
                </h3>
                <p className="text-sm text-gray-600">
                  {recipients.length} recipients shown
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {/* Filter by status */}
                <select
                  onChange={(e) => fetchRecipients(selectedCampaign.emailId, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
                <button
                  onClick={() => {
                    setShowRecipientsModal(false);
                    setSelectedCampaign(null);
                    setRecipients([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto max-h-[70vh]">
              {recipientsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading recipients...</p>
                  </div>
                </div>
              ) : recipients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recipients.map((recipient, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{recipient.name}</div>
                              <div className="text-sm text-gray-500">{recipient.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-mono text-blue-600">{recipient.applicationId}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              recipient.status === 'sent' ? 'bg-green-100 text-green-800' :
                              recipient.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {recipient.status === 'sent' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {recipient.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                              {recipient.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {recipient.sentAt ? formatDate(recipient.sentAt) : 'Not sent'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {recipient.error ? (
                              <div className="text-sm text-red-600 max-w-xs truncate" title={recipient.error}>
                                {recipient.error}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No error</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              {recipient.status === 'failed' && (
                                <button
                                  onClick={() => {
                                    // Individual retry functionality
                                    handleRetryCampaign(selectedCampaign.emailId);
                                  }}
                                  className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                  title="Retry"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recipients found</h3>
                  <p className="text-gray-600">No recipients match the current filter.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Total: {recipients.length} recipients
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Export recipients functionality
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + "Name,Email,Application ID,Status,Sent At,Error\n"
                      + recipients.map(r => `${r.name},${r.email},${r.applicationId},${r.status},${r.sentAt || ''},${r.error || ''}`).join("\n");
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `campaign-${selectedCampaign.emailId.slice(-8)}-recipients.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    setShowRecipientsModal(false);
                    setSelectedCampaign(null);
                    setRecipients([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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

export default BulkEmailManagement;