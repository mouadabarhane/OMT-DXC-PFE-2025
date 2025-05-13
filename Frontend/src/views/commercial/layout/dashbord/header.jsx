import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userLogout } from '../../../../features/auth/authActions';
import SearchButton from '../../components/SearchButton/SearchButton';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cartItemsCount] = useState(3); // Example cart items count

  // Get user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (userData) setCurrentUser(userData);
  }, []);

  // Client-specific notifications (unchanged design)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Order Shipped',
      message: 'Your order #12345 has been shipped',
      time: '2 hours ago',
      read: false,
      icon: 'ri-truck-line'
    },
    {
      id: 2,
      title: 'Special Offer',
      message: 'Exclusive 20% discount on your next purchase',
      time: '1 day ago',
      read: false,
      icon: 'ri-coupon-line'
    },
    {
      id: 3,
      title: 'Payment Received',
      message: 'We received your payment of $129.99',
      time: '2 days ago',
      read: true,
      icon: 'ri-money-dollar-circle-line'
    },
    {
      id: 4,
      title: 'Membership Update',
      message: 'Gold membership benefits have been extended',
      time: '1 week ago',
      read: true,
      icon: 'ri-vip-crown-line'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      localStorage.removeItem('currentUser');
      await dispatch(userLogout());
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  // Keep all original handlers exactly the same
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: true} : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  const quickAccessItems = [
    { label: 'Dashboard', path: '/client' },
    { label: 'Shop', path: '/client/shop' },
    { label: 'Orders', path: '/client/orders' },
    { label: 'Wishlist', path: '/client/wishlist' },
    { label: 'Support', path: '/client/support' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#065F46] shadow-sm border-b border-[#047857]">
      {/* Top Bar - Only changed the last login time to real data */}
      <div className="bg-[#047857] text-emerald-100 px-4 py-1.5 text-sm flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <span className="font-medium">Client Portal</span>
          <span className="w-px h-4 bg-emerald-300 bg-opacity-30"></span>
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 mr-1.5"></span>
            <span>Online</span>
          </span>
        </div>
        <div className="flex space-x-4 items-center">
          <span>Last seen: {currentUser ? new Date().toLocaleString() : 'Today'}</span>
          <span className="w-px h-4 bg-emerald-300 bg-opacity-30"></span>
          <button 
            onClick={handleLogout}
            className="hover:text-emerald-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Header - Only changed internal data, not design */}
      <div className="px-6 py-3 flex items-center justify-between bg-[#065F46]">
        {/* Logo and Quick Access (unchanged) */}
        <div className="flex items-center space-x-8">
          <div className="text-xl font-bold text-white flex items-center">
            <i className="ri-shopping-bag-3-line text-emerald-300 mr-2" />
            LuxeCart
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {quickAccessItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path}
                className="text-white hover:text-emerald-300 font-medium transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-300 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Search and User Area - Only data changes */}
        <div className="flex items-center space-x-4">
          {/* Search Bar (unchanged) */}
          <div className="hidden md:block w-64">
            <SearchButton 
              placeholder="Search products..." 
              darkMode={true}
            />
          </div>

          {/* Notification Dropdown (EXACTLY the same) */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-full hover:bg-[#047857] text-emerald-100 hover:text-emerald-300 transition-colors relative"
            >
              <i className="ri-notification-3-line text-xl"></i>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#065F46] rounded-lg shadow-xl border border-[#047857] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#047857] bg-[#047857] flex justify-between items-center">
                  <h3 className="font-medium text-white">My Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-300 hover:text-white"
                  >
                    Mark all as read
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 border-b border-[#047857] hover:bg-[#047857] transition-colors cursor-pointer ${
                          !notification.read ? 'bg-[#047857]' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            !notification.read ? 'bg-emerald-300/20 text-emerald-300' : 'bg-emerald-100/10 text-emerald-100'
                          }`}>
                            <i className={`${notification.icon} text-lg`}></i>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              !notification.read ? 'text-white' : 'text-emerald-100'
                            }`}>{notification.title}</h4>
                            <p className="text-sm text-emerald-200">{notification.message}</p>
                            <p className="text-xs text-emerald-300/70 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-emerald-300 ml-2 mt-1.5"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <i className="ri-notification-off-line text-3xl text-emerald-200/50 mb-2"></i>
                      <p className="text-emerald-200/70">No notifications</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-[#047857] bg-[#047857] text-center">
                  <Link 
                    to="/client/notifications" 
                    className="text-sm text-emerald-300 hover:text-white inline-block"
                    onClick={() => setNotificationOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Shopping Cart Icon (unchanged) */}
          <Link to="/client/cart" className="relative p-2 rounded-full hover:bg-[#047857] text-emerald-100 hover:text-emerald-300 transition-colors">
            <i className="ri-shopping-cart-2-line text-xl"></i>
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* User Profile - Only changed internal data (still shows "Client User" but with real email) */}
          <div className="flex items-center space-x-3 group relative cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-[#047857] flex items-center justify-center text-emerald-100 font-medium shadow-sm border border-emerald-300">
              {currentUser?.u_email?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-white group-hover:text-emerald-300 transition-colors">
                {currentUser?.u_name || 'User'}
              </p>
              <p className="text-xs text-emerald-300">
                {currentUser?.u_email || 'client@example.com'}
              </p>
            </div>

            {/* Dropdown Menu - Shows real email but keeps "Client User" text */}
            <div className="absolute right-0 top-full mt-1 w-64 bg-[#065F46] rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-[#047857]">
              <div className="px-4 py-3 border-b border-[#047857] bg-[#047857]">
                <p className="font-medium text-white">
                  {currentUser?.u_name || 'User'}
                </p>
                <p className="text-sm text-emerald-100">
                  {currentUser?.u_email || 'client@example.com'}
                </p>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-emerald-300">Gold Member</span>
                  <span className="text-emerald-300">Online Store</span>
                </div>
              </div>
              <Link to="/client/profile" className="block px-4 py-2.5 text-white hover:bg-[#047857] hover:text-emerald-300 transition-colors">
                My Profile
              </Link>
              <Link to="/client/settings" className="block px-4 py-2.5 text-white hover:bg-[#047857] hover:text-emerald-300 transition-colors">
                Account Settings
              </Link>
              <div className="border-t border-[#047857]"></div>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2.5 text-white hover:bg-[#047857] hover:text-red-400 transition-colors"
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