import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifications = useSelector(state => state.notifications?.items || []);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const sampleNotifications = [
    {
      id: 1,
      title: 'New User Registration',
      message: 'John Doe registered as a new user',
      time: '15 minutes ago',
      read: false,
      icon: 'ri-user-add-line'
    },
    {
      id: 2,
      title: 'System Alert',
      message: 'High CPU usage detected on server-02',
      time: '2 hours ago',
      read: false,
      icon: 'ri-alarm-warning-line'
    },
    {
      id: 3,
      title: 'Order Processed',
      message: 'Order #12345 has been completed',
      time: '1 day ago',
      read: true,
      icon: 'ri-shopping-cart-line'
    },
    {
      id: 4,
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for tonight',
      time: '2 days ago',
      read: true,
      icon: 'ri-tools-line'
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : sampleNotifications;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-[#006080] text-white hover:text-blue-200 transition-colors relative"
      >
        <i className="ri-notification-3-line text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#007B98] rounded-lg shadow-xl border border-[#006080] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#006080] bg-[#006080] flex justify-between items-center">
            <h3 className="font-medium text-white">Notifications ({unreadCount})</h3>
            <div className="flex space-x-2">
              <button className="text-xs text-blue-200 hover:text-white">
                Mark all as read
              </button>
              <button className="text-xs text-blue-200 hover:text-white">
                <i className="ri-settings-3-line"></i>
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {displayNotifications.length > 0 ? (
              displayNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-3 border-b border-[#006080] hover:bg-[#006080] transition-colors cursor-pointer ${
                    !notification.read ? 'bg-[#006080]/70' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      !notification.read ? 'bg-blue-200/20 text-blue-200' : 'bg-[#006080] text-white'
                    }`}>
                      <i className={`${notification.icon} text-lg`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        !notification.read ? 'text-white' : 'text-blue-100'
                      }`}>{notification.title}</h4>
                      <p className="text-sm text-blue-200">{notification.message}</p>
                      <p className="text-xs text-blue-300 mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-200 ml-2 mt-1.5"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <i className="ri-notification-off-line text-3xl text-blue-200 mb-2"></i>
                <p className="text-blue-200">No new notifications</p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-[#006080] bg-[#006080] text-center">
            <a 
              href="/admin/notifications" 
              className="text-sm text-blue-200 hover:text-white inline-flex items-center"
            >
              View all notifications <i className="ri-arrow-right-line ml-1"></i>
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #006080;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #004d66;
        }
      `}</style>
    </div>
  );
};

export default NotificationIcon;