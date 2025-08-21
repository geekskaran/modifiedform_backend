import React, { useState } from 'react';
import { Menu, LogOut, User, ChevronDown, Calendar, Clock } from 'lucide-react';

const Header = ({ user, onLogout, onToggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Mobile menu button + Page info */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Current Time */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{getCurrentTime()}</span>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-4">





          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Profile"
            >
              <User className="h-5 w-5" />
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {user?.username || 'Admin User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.email || 'admin@iitpatna.ac.in'}
                      </div>
                      <div className="text-xs text-green-600 flex items-center space-x-1 mt-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-2">

                  
                  <div className="px-4 py-2">
                    <div className="text-xs text-gray-500 mb-1">Last Login</div>
                    <div className="text-xs text-gray-700">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Today'}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;