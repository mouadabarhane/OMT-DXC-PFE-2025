import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';  // Add this import

const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifications = useSelector(state => state.notifications?.items || []);

  // Count unread notifications
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Sample notifications if Redux isn't set up
  const sampleNotifications = [
    {
      id: 1,
      title: 'New product feature request',
      message: 'Marketing team submitted a new feature request',
      time: '2 hours ago',
      read: false,
      icon: 'ri-lightbulb-flash-line'
    },
    {
      id: 2,
      title: 'Sprint review reminder',
      message: 'Sprint review meeting starts in 30 minutes',
      time: '5 hours ago',
      read: false,
      icon: 'ri-calendar-todo-line'
    },
    {
      id: 3,
      title: 'New comment on PRD',
      message: 'James commented on the Product Requirements Document',
      time: '1 day ago',
      read: true,
      icon: 'ri-message-2-line'
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : sampleNotifications;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-[#111827] text-gray-300 hover:text-white transition-colors relative"
      >
        <i className="ri-notification-3-line text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1F2937] rounded-lg shadow-xl border border-[#374151] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#374151] bg-[#111827] flex justify-between items-center">
            <h3 className="font-medium text-gray-100">Notifications</h3>
            <button className="text-xs text-blue-400 hover:text-blue-300">
              Mark all as read
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {displayNotifications.length > 0 ? (
              displayNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-3 border-b border-[#374151] hover:bg-[#111827] transition-colors ${
                    !notification.read ? 'bg-[#111827]' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      !notification.read ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      <i className={`${notification.icon || 'ri-information-line'} text-lg`}></i>
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
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
    </div>
  );
};

export default NotificationIcon;