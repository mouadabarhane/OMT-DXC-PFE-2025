import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Dropdown, Space, message } from 'antd';
import { userLogout } from '../../../../features/auth/authActions';
import SearchButton from '../../components/SearchButton/SearchButton';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (userData) {
      setCurrentUser(userData);
    }
  }, []);

  // Product Manager notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Feature Request',
      message: 'Marketing team submitted a new feature request for Q3',
      time: '2 hours ago',
      read: false,
      icon: 'ri-lightbulb-flash-line'
    },
    {
      id: 2,
      title: 'Sprint Review',
      message: 'Sprint review meeting starts in 30 minutes',
      time: '5 hours ago',
      read: false,
      icon: 'ri-calendar-todo-line'
    },
    {
      id: 3,
      title: 'PRD Feedback',
      message: 'Engineering left comments on the Product Requirements Document',
      time: '1 day ago',
      read: true,
      icon: 'ri-file-text-line'
    },
    {
      id: 4,
      title: 'Release Approved',
      message: 'Version 2.3.0 has been approved for production',
      time: '2 days ago',
      read: true,
      icon: 'ri-checkbox-circle-line'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      const cleanupClientStorage = () => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
      };

      cleanupClientStorage();
      const result = await dispatch(userLogout());
      if (userLogout.fulfilled.match(result)) {
        message.success('Logged out successfully');
      }
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Logged out locally (API failed)');
      navigate('/login', { replace: true });
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: true} : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  // Quick access menu items for product manager
  const quickAccessItems = [
    { label: 'Dashboard', path: '/product-manager' },
    { label: 'Roadmap', path: '#' },
    { label: 'Features', path: '#' },
    { label: 'Releases', path: '#' },
    { label: 'Analytics', path: '#' }
  ];

  const userMenuItems = [
    {
      label: (
        <div className="px-4 py-2 bg-[#111827] border-b border-[#374151]">
          <div className="font-medium text-gray-100">{currentUser?.name || 'Product Manager'}</div>
          <div className="text-sm text-gray-400">{currentUser?.email || 'pm@company.com'}</div>
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-gray-400">{currentUser?.department || 'Product Team'}</span>
            <span className="text-gray-400">{currentUser?.location || 'HQ Office'}</span>
          </div>
        </div>
      ),
      key: 'user-info',
      type: 'group',
    },
    {
      type: 'divider',
      style: { backgroundColor: '#374151' }
    },
    {
      label: <Link to="/profile" className="block px-4 py-2.5 text-gray-300 hover:bg-[#111827] hover:text-blue-400 transition-colors"><i className="ri-user-line mr-2"></i> My Profile</Link>,
      key: 'profile',
    },
    {
      label: <Link to="/settings" className="block px-4 py-2.5 text-gray-300 hover:bg-[#111827] hover:text-blue-400 transition-colors"><i className="ri-settings-3-line mr-2"></i> Product Settings</Link>,
      key: 'settings',
    },
    {
      type: 'divider',
      style: { backgroundColor: '#374151' }
    },
    {
      label: (
        <div 
          onClick={handleLogout}
          className="block px-4 py-2.5 text-gray-300 hover:bg-[#111827] hover:text-red-400 transition-colors"
        >
          <i className="ri-shut-down-line mr-2"></i> Sign Out
        </div>
      ),
      key: 'logout',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1F2937] shadow-sm border-b border-[#374151]">
      {/* Top Bar */}
      <div className="bg-[#111827] text-gray-300 px-4 py-1.5 text-sm flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <span className="font-medium">Product Management Portal</span>
          <span className="w-px h-4 bg-gray-500 bg-opacity-30"></span>
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
            <span>System Operational</span>
          </span>
        </div>
        <div className="flex space-x-4 items-center">
          <span>Last login: {currentUser ? new Date().toLocaleString() : 'Today'}</span>
          <span className="w-px h-4 bg-gray-500 bg-opacity-30"></span>
          <button 
            onClick={handleLogout}
            className="hover:text-blue-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-3 flex items-center justify-between bg-[#1F2937]">
        {/* Logo and Quick Access */}
        <div className="flex items-center space-x-8">
          <div className="text-xl font-bold text-gray-100 flex items-center">
            <i className="ri-product-hunt-line text-blue-400 mr-2" />
            Product Hub
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {quickAccessItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path}
                className="text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Search and User Area */}
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="hidden md:block w-72">
            <SearchButton 
              placeholder="Search products, features..." 
              darkMode={true}
            />
          </div>

          {/* Notification Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-full hover:bg-[#111827] text-gray-300 hover:text-white transition-colors relative"
            >
              <i className="ri-notification-3-line text-xl"></i>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#1F2937] rounded-lg shadow-xl border border-[#374151] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#374151] bg-[#111827] flex justify-between items-center">
                  <h3 className="font-medium text-gray-100">Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Mark all as read
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 border-b border-[#374151] hover:bg-[#111827] transition-colors cursor-pointer ${
                          !notification.read ? 'bg-[#111827]' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            !notification.read ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-600/20 text-gray-400'
                          }`}>
                            <i className={`${notification.icon} text-lg`}></i>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              !notification.read ? 'text-white' : 'text-gray-300'
                            }`}>{notification.title}</h4>
                            <p className="text-sm text-gray-400">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-400 ml-2 mt-1.5"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <i className="ri-notification-off-line text-3xl text-gray-500 mb-2"></i>
                      <p className="text-gray-400">No notifications</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-[#374151] bg-[#111827] text-center">
                  <Link 
                    to="/notifications" 
                    className="text-sm text-blue-400 hover:text-blue-300 inline-block"
                    onClick={() => setNotificationOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          {currentUser && (
            <div className="flex items-center space-x-3 group relative cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-[#111827] flex items-center justify-center text-blue-400 font-medium shadow-sm border border-[#374151]">
                {currentUser.name?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-gray-100 group-hover:text-blue-400 transition-colors">
                  {currentUser.name || 'Product Manager'}
                </p>
                <p className="text-xs text-gray-400">
                  {currentUser.title || 'Senior Product Manager'}
                </p>
              </div>

              {/* Profile Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-64 bg-[#1F2937] rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-[#374151]">
                <div className="px-4 py-3 border-b border-[#374151] bg-[#111827]">
                  <p className="font-medium text-white">{currentUser.name || 'Product Manager'}</p>
                  <p className="text-sm text-gray-400 truncate">{currentUser.email || 'pm@company.com'}</p>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-gray-500">{currentUser.department || 'Product Team'}</span>
                    <span className="text-gray-500">{currentUser.location || 'HQ Office'}</span>
                  </div>
                </div>
                <Link to="/profile" className="block px-4 py-2.5 text-gray-300 hover:bg-[#111827] hover:text-blue-400 transition-colors">
                  <i className="ri-user-line mr-2"></i> My Profile
                </Link>
                <Link to="/settings" className="block px-4 py-2.5 text-gray-300 hover:bg-[#111827] hover:text-blue-400 transition-colors">
                  <i className="ri-settings-3-line mr-2"></i> Product Settings
                </Link>
                <div className="border-t border-[#374151]"></div>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 text-gray-300 hover:bg-[#111827] hover:text-red-400 transition-colors"
                >
                  <i className="ri-shut-down-line mr-2"></i> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;