import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userLogout } from '../../../../features/auth/authActions';
import SearchButton from '../../components/SearchButton/SearchButton';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const analystUser = {
    name: user?.name || 'Data Analyst',
    email: user?.email || 'analyst@company.com',
    department: user?.department || 'Analytics Team',
    location: user?.location || 'Data Center',
    title: user?.title || 'Senior Data Analyst',
    lastLogin: user?.lastLogin || new Date().toLocaleString()
  };

  // Data Analyst specific notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Dataset Available',
      message: 'Q3 Sales data has been processed and is ready for analysis',
      time: '3 hours ago',
      read: false,
      icon: 'ri-database-2-line'
    },
    {
      id: 2,
      title: 'Report Generation Complete',
      message: 'Monthly performance report has been generated',
      time: '5 hours ago',
      read: false,
      icon: 'ri-file-chart-line'
    },
    {
      id: 3,
      title: 'Data Pipeline Alert',
      message: 'ETL job completed with 3 warnings',
      time: '1 day ago',
      read: true,
      icon: 'ri-flow-chart-line'
    },
    {
      id: 4,
      title: 'Dashboard Update',
      message: 'Executive dashboard has been refreshed with new metrics',
      time: '2 days ago',
      read: true,
      icon: 'ri-dashboard-line'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      await dispatch(userLogout());
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
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

  const quickAccessItems = [
    { label: 'Dashboards', path: '/data-analyst' },
    { label: 'Datasets', path: '/data-analyst/data-exploration/datasets' },
    { label: 'Visualizations', path: '/data-analyst/data-exploration/visualization' },
    { label: 'Reports', path: '/data-analyst/reports' },
    { label: 'AI Tools', path: '/data-analyst/ai-tools' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#2E1B5B] shadow-sm border-b border-[#4A3B76]">
      {/* Top Bar */}
      <div className="bg-[#1A1039] text-purple-100 px-4 py-1.5 text-sm flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <span className="font-medium">Data Analytics Portal</span>
          <span className="w-px h-4 bg-purple-300 bg-opacity-30"></span>
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FFD700] mr-1.5"></span>
            <span>Live Data Connection</span>
          </span>
        </div>
        <div className="flex space-x-4 items-center">
          <span>Last sync: {analystUser.lastLogin}</span>
          <span className="w-px h-4 bg-purple-300 bg-opacity-30"></span>
          <button 
            onClick={handleLogout}
            className="hover:text-[#FFD700] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-6 py-3 flex items-center justify-between bg-[#2E1B5B]">
        {/* Logo and Quick Access */}
        <div className="flex items-center space-x-8">
          <div className="text-xl font-bold text-white flex items-center">
            <i className="ri-bar-chart-box-line text-[#FFD700] mr-2" />
            Data Lab
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {quickAccessItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path}
                className="text-purple-100 hover:text-[#FFD700] font-medium transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Search and User Area */}
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="hidden md:block w-72">
            <SearchButton 
              placeholder="Search datasets, reports..." 
              darkMode={true}
            />
          </div>

          {/* Notification Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-full hover:bg-[#1A1039] text-purple-100 hover:text-[#FFD700] transition-colors relative"
            >
              <i className="ri-notification-3-line text-xl"></i>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#2E1B5B] rounded-lg shadow-xl border border-[#4A3B76] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#4A3B76] bg-[#1A1039] flex justify-between items-center">
                  <h3 className="font-medium text-white">Data Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-[#FFD700] hover:text-white"
                  >
                    Mark all as read
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 border-b border-[#4A3B76] hover:bg-[#1A1039] transition-colors cursor-pointer ${
                          !notification.read ? 'bg-[#1A1039]' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            !notification.read ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'bg-purple-100/10 text-purple-100'
                          }`}>
                            <i className={`${notification.icon} text-lg`}></i>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              !notification.read ? 'text-white' : 'text-purple-100'
                            }`}>{notification.title}</h4>
                            <p className="text-sm text-purple-200">{notification.message}</p>
                            <p className="text-xs text-purple-300/70 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-[#FFD700] ml-2 mt-1.5"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <i className="ri-notification-off-line text-3xl text-purple-200/50 mb-2"></i>
                      <p className="text-purple-200/70">No notifications</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-[#4A3B76] bg-[#1A1039] text-center">
                  <Link 
                    to="/data-analyst/notifications" 
                    className="text-sm text-[#FFD700] hover:text-white inline-block"
                    onClick={() => setNotificationOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 group relative cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-[#1A1039] flex items-center justify-center text-[#FFD700] font-medium shadow-sm border border-[#4A3B76]">
              {analystUser.name.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-white group-hover:text-[#FFD700] transition-colors">{analystUser.name}</p>
              <p className="text-xs text-purple-200">{analystUser.title}</p>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-1 w-64 bg-[#2E1B5B] rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-[#4A3B76]">
              <div className="px-4 py-3 border-b border-[#4A3B76] bg-[#1A1039]">
                <p className="font-medium text-white">{analystUser.name}</p>
                <p className="text-sm text-purple-200">{analystUser.email}</p>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-purple-300">{analystUser.department}</span>
                  <span className="text-purple-300">{analystUser.location}</span>
                </div>
              </div>
              <Link to="/profile" className="block px-4 py-2.5 text-purple-100 hover:bg-[#1A1039] hover:text-[#FFD700] transition-colors">My Profile</Link>
              <Link to="/settings" className="block px-4 py-2.5 text-purple-100 hover:bg-[#1A1039] hover:text-[#FFD700] transition-colors">Workspace Settings</Link>
              <div className="border-t border-[#4A3B76]"></div>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2.5 text-purple-100 hover:bg-[#1A1039] hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;