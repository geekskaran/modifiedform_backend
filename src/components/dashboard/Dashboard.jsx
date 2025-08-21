import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Mail,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
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
      
      // Fixed: Using correct port 5000 instead of 4000
      const response = await fetch('https://test2.codevab.com/api/dashboard/overview', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.overview);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Connection error. Please ensure the server is running on port 4000.');
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
            <p className="text-sm text-gray-500">
              Make sure your server is running on port 4000
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Manage email templates and review application forms.
          </p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Templates</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.templates?.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.applications?.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.applications?.byStatus?.submitted || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.applications?.byStatus?.approved || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Actions - Two Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Create Email Template Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Create Email Template
              </h2>
              
              <p className="text-gray-600 mb-6">
                Create, write, and save different types of email templates for various scenarios.
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
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Rejection Templates</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigateTo('/admin/templates/create')}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create New Template</span>
                </button>
                
                <button
                  onClick={() => navigateTo('/admin/templates')}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="h-5 w-5" />
                  <span>View All Templates ({stats?.templates?.total || 0})</span>
                </button>
              </div>
            </div>
          </div>

          {/* View Application Forms Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                View Application Forms
              </h2>
              
              <p className="text-gray-600 mb-6">
                Review submitted applications, update statuses, add remarks, and send bulk emails to selected students.
              </p>

              {/* Application Status Overview */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-yellow-800">
                    {stats?.applications?.byStatus?.submitted || 0}
                  </div>
                  <div className="text-sm text-yellow-600">Pending</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-blue-800">
                    {stats?.applications?.byStatus?.under_review || 0}
                  </div>
                  <div className="text-sm text-blue-600">Under Review</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-green-800">
                    {stats?.applications?.byStatus?.approved || 0}
                  </div>
                  <div className="text-sm text-green-600">Approved</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-red-800">
                    {stats?.applications?.byStatus?.rejected || 0}
                  </div>
                  <div className="text-sm text-red-600">Rejected</div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigateTo('/admin/applications')}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Users className="h-5 w-5" />
                  <span>View All Applications ({stats?.applications?.total || 0})</span>
                </button>
                

              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Dashboard;