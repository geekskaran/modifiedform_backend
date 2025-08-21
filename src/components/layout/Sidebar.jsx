import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Mail, 
  Users, 
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, currentPath, isCollapsed = false }) => {
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

  ];

  const isActiveRoute = (path) => {
    if (path === '/admin/dashboard') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className={`
      fixed lg:static inset-y-0 left-0 z-50
      ${isCollapsed ? 'w-16' : 'w-64'} 
      bg-white shadow-lg transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      flex flex-col h-full
    `}>
      {/* Header */}
      <div className={`
        flex items-center justify-between p-6 border-b border-gray-200
        ${isCollapsed ? 'px-3' : 'px-6'}
      `}>
        {!isCollapsed ? (
          <div>
            <h1 className="text-xl font-bold text-gray-900">IIT Patna R&D</h1>
            <p className="text-sm text-gray-600">Admin Panel</p>
          </div>
        ) : (
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">IP</span>
          </div>
        )}
        
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-6 space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`
                group flex items-center rounded-lg text-sm font-medium transition-colors
                ${isCollapsed ? 'p-3 justify-center' : 'px-3 py-3'}
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`
                h-5 w-5 flex-shrink-0
                ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                ${isCollapsed ? '' : 'mr-3'}
              `} />
              
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className={`
                    text-xs mt-0.5
                    ${isActive ? 'text-blue-600' : 'text-gray-500'}
                  `}>
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500 text-center">
            <div>IIT Patna R&D</div>
            <div>Admin Panel v2.0</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;