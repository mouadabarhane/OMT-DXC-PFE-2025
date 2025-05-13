import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const handleLogout = async (e) => {
    e.preventDefault();
    // Your logout logic here
    console.log('Logging out...');
  };

  const toggleExpand = (path) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const isActive = (path) => {
    return location.pathname.toLowerCase() === path.toLowerCase();
  };

  const isChildActive = (children) => {
    return children.some(child =>
      location.pathname.toLowerCase().startsWith(child.path.toLowerCase())
    );
  };

  const navItems = [
    {
      path: '/admin',
      icon: 'dashboard-line',
      text: 'Dashboard',
      children: [
        { path: '/admin/overview', icon: 'bar-chart-line', text: 'Overview' },
        { path: '#', icon: 'pie-chart-line', text: 'Analytics' },
        { path: '#', icon: 'pulse-line', text: 'Activity Log' }
      ]
    },
    {
      path: '/admin/users',
      icon: 'user-settings-line',
      text: 'User Management',
      children: [
        { path: '/admin/users/AllUsers', icon: 'team-line', text: 'All Users' },
        { path: '/admin/users/Roles&Permissions', icon: 'shield-user-line', text: 'Roles & Permissions' },
        { path: '/admin/users/UserActivity', icon: 'history-line', text: 'User Activity' }
      ]
    },
    {
      path: '/admin/products',
      icon: 'shopping-bag-line',
      text: 'Product Management',
      children: [
        { path: '#', icon: 'archive-line', text: 'Inventory' },
        { path: '#', icon: 'price-tag-line', text: 'Categories' },
        { path: '#', icon: 'star-line', text: 'Reviews' }
      ]
    },
    {
      path: '/admin/orders',
      icon: 'shopping-cart-line',
      text: 'Order Management',
      children: [
        { path: '#', icon: 'file-list-3-line', text: 'All Orders' },
        { path: '#', icon: 'exchange-line', text: 'Transactions' },
        { path: '#', icon: 'arrow-go-back-line', text: 'Returns' }
      ]
    },
    {
      path: '/admin/content',
      icon: 'file-text-line',
      text: 'Content Management',
      children: [
        { path: '#', icon: 'pages-line', text: 'Pages' },
        { path: '#', icon: 'image-line', text: 'Media Library' },
        { path: '#', icon: 'layout-line', text: 'Content Blocks' }
      ]
    },
    {
      path: '/admin/system',
      icon: 'settings-line',
      text: 'System Settings',
      children: [
        { path: '#', icon: 'settings-3-line', text: 'General' },
        { path: '#', icon: 'notification-line', text: 'Notifications' },
        { path: '#', icon: 'links-line', text: 'Integrations' }
      ]
    },
    {
      path: '/admin/reports',
      icon: 'file-chart-line',
      text: 'Reports',
      children: [
        { path: '#', icon: 'bar-chart-line', text: 'Sales Reports' },
        { path: '#', icon: 'user-heart-line', text: 'User Reports' },
        { path: '#', icon: 'database-line', text: 'System Reports' }
      ]
    }
  ];

  return (
    <>
      <aside className="z-30 h-screen fixed bg-[#007B98] inset-y-0 py-4 px-4 shadow-lg overflow-hidden w-64 border-r border-gray-100 flex flex-col">
        {/* Logo Section */}
        <div className="mb-8 mt-2 h-12 flex items-center px-2 text-white font-bold text-xl">
          <i className="ri-admin-line mr-2 text-blue-200" />
          Admin Studio
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const hasChildren = item.children?.length > 0;
              const isItemActive = isActive(item.path) || (hasChildren && isChildActive(item.children));
              const isExpanded = expandedItems[item.path];

              return (
                <li key={item.path}>
                  <div className="flex flex-col overflow-hidden rounded-lg">
                    <Link
                      to={item.path}
                      onClick={(e) => {
                        if (hasChildren) {
                          e.preventDefault();
                          toggleExpand(item.path);
                        }
                      }}
                      className={`flex items-center px-3 py-2.5 transition-all duration-200 ${
                        isItemActive 
                          ? 'bg-[#006080] text-white shadow-md' 
                          : 'text-white hover:bg-[#006080] hover:text-white'
                      }`}
                    >
                      <i className={`ri-${item.icon} mr-3 text-lg`} />
                      <span className="font-medium flex-1">{item.text}</span>
                      {hasChildren && (
                        <i className={`ri-arrow-right-s-line transition-transform duration-200 ${
                          isExpanded ? 'transform rotate-90' : ''
                        }`} />
                      )}
                    </Link>

                    {hasChildren && isExpanded && (
                      <ul className="ml-8 mt-1 space-y-1 py-1 animate-fadeIn">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              className={`flex items-center px-3 py-2 text-sm rounded transition-all duration-200 ${
                                isActive(child.path) 
                                  ? 'bg-[#e6f4ff] text-[#007B98] font-medium' 
                                  : 'text-white hover:bg-[#006080] hover:text-white'
                              }`}
                            >
                              <i className={`ri-${child.icon} mr-3 text-base`} />
                              <span>{child.text}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="border-t border-[#006080] pt-2 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-white hover:bg-[#006080] transition-colors duration-200 group rounded-lg"
          >
            <i className="ri-logout-circle-r-line mr-3 text-lg group-hover:animate-pulse" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Spacer for main content */}
      <div className="ml-64" />
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #006080;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #004d66;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .group-hover\:animate-pulse:hover {
          animation: pulse 1s infinite;
        }
      `}</style>
    </>
  );
};

export default Sidebar;