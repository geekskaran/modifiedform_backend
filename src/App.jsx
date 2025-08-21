import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Components
import ApplicationForm from './components/ApplicationForm';

// Admin Components
import AdminLayout from './components/layout/AdminLayout';
import Login from './components/Login';
import Dashboard from './components/dashboard/Dashboard';
import TemplateList from './components/template/TemplateList';
import TemplateForm from './components/template/TemplateForm';
import ApplicationsGrid from './components/applications/ApplicationsGrid';
import BulkEmailManagement from './components/bulk-email/BulkEmailManagement';

// Auth Hook
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    }
    setLoading(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    loading,
    user,
    handleLoginSuccess,
    handleLogout
  };
};

// Protected Route Component
const ProtectedRoute = ({ children, auth }) => {
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout user={auth.user} onLogout={auth.handleLogout}>
      {children}
    </AdminLayout>
  );
};

// Admin Login Route
const AdminLoginRoute = ({ auth }) => {
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Login onLoginSuccess={auth.handleLoginSuccess} />;
};

function App() {
  const auth = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ApplicationForm />} />
          
          {/* Admin Login */}
          <Route 
            path="/admin/login" 
            element={<AdminLoginRoute auth={auth} />} 
          />
          
          {/* Admin Routes - All Protected */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute auth={auth}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* FIXED: Changed from /admin/template to /admin/templates to match sidebar */}
          <Route 
            path="/admin/templates" 
            element={
              <ProtectedRoute auth={auth}>
                <TemplateList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/templates/create" 
            element={
              <ProtectedRoute auth={auth}>
                <TemplateForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/templates/edit/:id" 
            element={
              <ProtectedRoute auth={auth}>
                <TemplateForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/applications" 
            element={
              <ProtectedRoute auth={auth}>
                <ApplicationsGrid />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/bulk-email" 
            element={
              <ProtectedRoute auth={auth}>
                <BulkEmailManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect /admin to dashboard */}
          <Route 
            path="/admin" 
            element={<Navigate to="/admin/dashboard" replace />} 
          />
          
          {/* Legacy route redirects - Keep old paths working */}
          <Route 
            path="/admin/template" 
            element={<Navigate to="/admin/templates" replace />} 
          />
          
          <Route 
            path="/admin/template/create" 
            element={<Navigate to="/admin/templates/create" replace />} 
          />
          
          <Route 
            path="/admin/template/edit/:id" 
            element={<Navigate to="/admin/templates/edit/:id" replace />} 
          />
          
          <Route 
            path="/applications" 
            element={<Navigate to="/admin/applications" replace />} 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;