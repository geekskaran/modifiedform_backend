import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Mail, 
  Users, 
  Settings,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, currentPath }) => {
  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    {
      path: '/admin/templates',
      label: 'Email Templates',
      icon: FileText,
      description: 'Manage Templates'
    },
    {
      path: '/admin/applications',
      label: 'Applications',
      icon: Users,
      description: 'View Applications'
    },
    {
      path: '/admin/bulk-email',
      label: 'Bulk Email',
      icon: Mail,
      description: 'Email Campaigns'
    }
  ];

  const isActiveRoute = (path) => {
    if (path === '/admin/dashboard') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">IIT Patna R&D</h1>
            <p className="text-sm text-gray-600">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className={`
                    text-xs mt-0.5
                    ${isActive ? 'text-blue-600' : 'text-gray-500'}
                  `}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Admin Management System
            <br />
            <span className="text-blue-600">v1.0.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;