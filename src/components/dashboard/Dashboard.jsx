import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Mail, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('Dashboard useEffect triggered');
    
    // Prevent duplicate calls in StrictMode
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchDashboardData();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/admin/login';
        return;
      }

      // First verify token works
      console.log('Step 1: Verifying token...');
      const verifyResponse = await fetch('http://localhost:4000/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!verifyResponse.ok) {
        console.log('Token verification failed');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
        return;
      }

      const verifyData = await verifyResponse.json();
      console.log('Token verification successful:', verifyData);

      // Now try dashboard with verified token
      console.log('Step 2: Fetching dashboard...');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Dashboard request headers:', headers);
      
      const response = await fetch('http://localhost:4000/api/dashboard/overview', {
        headers: headers
      });

      console.log('Dashboard response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);
        setStats(data.overview);
      } else {
        const errorText = await response.text();
        console.log('Dashboard error response:', errorText);
        
        if (response.status === 401) {
          // Try alternative approach - create mock data or use different endpoint
          console.log('Dashboard auth failed, using fallback data');
          setStats({
            applications: { total: 0, recent: 0, byStatus: {} },
            templates: { total: 0, drafts: 0 },
            bulkEmails: { total: 0, statistics: { totalSuccess: 0, totalRecipients: 0 } }
          });
        } else {
          setError(`Dashboard error: ${errorText}`);
        }
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      // Fallback data instead of error
      setStats({
        applications: { total: 0, recent: 0, byStatus: {} },
        templates: { total: 0, drafts: 0 },
        bulkEmails: { total: 0, statistics: { totalSuccess: 0, totalRecipients: 0 } }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600'
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
          <p className="text-gray-600">Loading dashboard...</p>
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
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              IIT Patna R&D Applications Dashboard
            </h1>
            <p className="text-gray-600">
              Manage and review submitted applications
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Applications"
            value={stats.applications?.total || 0}
            icon={Users}
            color="blue"
            subtitle={`${stats.applications?.recent || 0} this month`}
          />
          <StatCard
            title="Email Templates"
            value={stats.templates?.total || 0}
            icon={FileText}
            color="green"
            subtitle={`${stats.templates?.drafts || 0} drafts`}
          />
          <StatCard
            title="Emails Sent"
            value={stats.bulkEmails?.statistics?.totalSuccess || 0}
            icon={Mail}
            color="purple"
            subtitle={`${stats.bulkEmails?.total || 0} campaigns`}
          />
          <StatCard
            title="Success Rate"
            value={stats.bulkEmails?.statistics?.totalRecipients > 0 
              ? `${Math.round((stats.bulkEmails.statistics.totalSuccess / stats.bulkEmails.statistics.totalRecipients) * 100)}%`
              : '0%'
            }
            icon={TrendingUp}
            color="indigo"
            subtitle="Email delivery"
          />
        </div>
      )}

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Email Template Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Email Template
            </h2>
            <p className="text-gray-600 mb-6">
              Create, write, and save different types of email templates for various application statuses.
            </p>
            
            {/* Template Categories */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Success/Approval Templates</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Interview Invitation Templates</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Rejection Templates</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/admin/templates/create"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Template</span>
              </Link>
              <Link
                to="/admin/templates"
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Eye className="h-5 w-5" />
                <span>View All Templates ({stats?.templates?.total || 0})</span>
              </Link>
            </div>
          </div>
        </div>

        {/* View Application Forms Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              View Application Forms
            </h2>
            <p className="text-gray-600 mb-6">
              Review submitted applications, update statuses, add remarks, and send bulk emails to selected students.
            </p>

            {/* Application Status Overview */}
            {stats?.applications?.byStatus && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-yellow-800">
                    {stats.applications.byStatus.submitted || 0}
                  </div>
                  <div className="text-sm text-yellow-600">Submitted</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-blue-800">
                    {stats.applications.byStatus.under_review || 0}
                  </div>
                  <div className="text-sm text-blue-600">Under Review</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-green-800">
                    {stats.applications.byStatus.approved || 0}
                  </div>
                  <div className="text-sm text-green-600">Approved</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-red-800">
                    {stats.applications.byStatus.rejected || 0}
                  </div>
                  <div className="text-sm text-red-600">Rejected</div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/admin/applications"
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Users className="h-5 w-5" />
                <span>View All Applications ({stats?.applications?.total || 0})</span>
              </Link>
              <Link
                to="/admin/bulk-email"
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Mail className="h-5 w-5" />
                <span>Bulk Email Management</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/applications?status=submitted"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">New Applications</div>
                  <div className="text-sm text-gray-500">
                    {stats.applications?.byStatus?.submitted || 0} pending review
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/templates/create"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Quick Template</div>
                  <div className="text-sm text-gray-500">Create new template</div>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/bulk-email"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Send Emails</div>
                  <div className="text-sm text-gray-500">Bulk email campaigns</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;