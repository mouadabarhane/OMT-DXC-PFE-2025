import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({
    '/product-manager': true
  });

  const handleLogout = async (e) => {
    e.preventDefault();
    console.log('Logging out...');
    // Add your logout logic here
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
      path: '/product-manager',
      icon: 'dashboard-line',
      text: 'Dashboard',
      children: [
        { path: '/product-manager/overview', icon: 'bar-chart-2-line', text: 'Overview' },
        { path: '/product-manager/performance', icon: 'speed-line', text: 'Performance' },
        { path: '/product-manager/kpis', icon: 'medal-line', text: 'KPIs' }
      ]
    },
    {
      path: '/product-manager/products',
      icon: 'shopping-bag-line',
      text: 'Product Catalog',
      children: [
        { path: '/product-manager/products/categories', icon: 'price-tag-3-line', text: 'Categories' },
        { path: '/product-manager/products/inventory', icon: 'store-line', text: 'Inventory' },
        { path: '/product-manager/products/pricing', icon: 'exchange-dollar-line', text: 'Pricing' }
      ]
    },
    {
      path: '/product-manager/offerings',
      icon: 'box-3-line',
      text: 'Offerings',
      children: [
        { path: '/product-manager/offerings/manage', icon: 'stack-line', text: 'Manage Offerings' },
        { path: '#', icon: 'gift-line', text: 'Bundles' },
        { path: '#', icon: 'boxing-line', text: 'Packages' },
        { path: '#', icon: 'discount-percent-line', text: 'Promotions' }
      ]
    },
    {
      path: '/product-manager/specifications',
      icon: 'file-list-3-line',
      text: 'Specifications',
      children: [
        { path: '/product-manager/specifications/TechnicalSpec', icon: 'cpu-line', text: 'Technical Specs' },
        { path: '/product-manager/specifications/features', icon: 'list-settings-line', text: 'Features' },
        { path: '/product-manager/specifications/requirements', icon: 'file-code-line', text: 'Requirements' },
        { path: '/product-manager/specifications/compliance', icon: 'shield-check-line', text: 'Compliance' }
      ]
    },
    {
      path: '/product-manager/roadmap',
      icon: 'map-2-line',
      text: 'Roadmap',
      children: [
        { path: '/product-manager/roadmap/strategy', icon: 'lightbulb-line', text: 'Strategy' },
        { path: '/product-manager/roadmap/releases', icon: 'rocket-line', text: 'Releases' },
        { path: '/product-manager/roadmap/backlog', icon: 'task-line', text: 'Backlog' },
        { path: '/product-manager/roadmap/timeline', icon: 'calendar-todo-line', text: 'Timeline' }
      ]
    },
    {
      path: '/product-manager/insights',
      icon: 'line-chart-line',
      text: 'Market Insights',
      children: [
        { path: '/product-manager/insights/feedback', icon: 'feedback-line', text: 'Customer Feedback' },
        { path: '/product-manager/insights/competitors', icon: 'sword-line', text: 'Competitors' },
        { path: '/product-manager/insights/trends', icon: 'shield-check-line', text: 'Market Trends' },
        { path: '/product-manager/insights/analytics', icon: 'pie-chart-2-line', text: 'Product Analytics' }
      ]
    }
  ];

  return (
    <>
      <aside className="z-30 h-screen fixed bg-[#1F2937] inset-y-0 py-4 px-4 shadow-lg overflow-hidden w-64 border-r border-[#374151] flex flex-col">
        {/* Logo Section */}
        <div className="mb-8 mt-2 h-12 flex items-center px-2 text-gray-100 font-bold text-xl">
          <i className="ri-product-hunt-line mr-2 text-blue-400" />
          Product Suite
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
                          ? 'bg-[#111827] text-blue-400 shadow-md' 
                          : 'text-gray-300 hover:bg-[#111827] hover:text-white'
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
                                  ? 'bg-blue-400 text-[#111827] font-medium' 
                                  : 'text-gray-300 hover:bg-[#111827] hover:text-white'
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
        <div className="border-t border-[#374151] pt-2 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-[#111827] hover:text-blue-400 transition-colors duration-200 group rounded-lg"
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
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4B5563;
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