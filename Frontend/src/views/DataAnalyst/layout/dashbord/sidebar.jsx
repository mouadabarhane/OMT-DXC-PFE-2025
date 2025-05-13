import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

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
      path: '/data-analyst',
      icon: 'dashboard-line',
      text: 'Dashboard',
      children: [
        { path: '/data-analyst/overview', icon: 'bar-chart-2-line', text: 'Overview' },
        { path: '/data-analyst/performance', icon: 'speed-line', text: 'Performance' }
      ]
    },
    {
      path: '/data-analyst/data-exploration',
      icon: 'database-2-line',
      text: 'Data Exploration',
      children: [
        { path: '/data-analyst/data-exploration/datasets', icon: 'database-line', text: 'Datasets' },
        { path: '/data-analyst/data-exploration/queries', icon: 'terminal-box-line', text: 'SQL Editor' },
        { path: '/data-analyst/data-exploration/visualization', icon: 'bubble-chart-line', text: 'Visualization' }
      ]
    },
    {
      path: '/data-analyst/reports',
      icon: 'file-chart-line',
      text: 'Reports',
      children: [
        { path: '/data-analyst/reports/scheduled', icon: 'calendar-line', text: 'Scheduled' },
        { path: '/data-analyst/reports/ad-hoc', icon: 'magic-line', text: 'Ad-Hoc' },
        { path: '/data-analyst/reports/templates', icon: 'file-copy-line', text: 'Templates' }
      ]
    },
    {
      path: '/data-analyst/analysis',
      icon: 'line-chart-line',
      text: 'Advanced Analysis',
      children: [
        { path: '/data-analyst/analysis/trends', icon: 'trending-up-line', text: 'Trend Analysis' },
        { path: '/data-analyst/analysis/forecasting', icon: 'line-chart-line', text: 'Forecasting' },
        { path: '/data-analyst/analysis/segmentation', icon: 'node-tree', text: 'Customer Segmentation' }
      ]
    },
    {
      path: '/data-analyst/integrations',
      icon: 'links-line',
      text: 'Data Sources',
      children: [
        { path: '/data-analyst/integrations/connections', icon: 'plug-line', text: 'Connections' },
        { path: '/data-analyst/integrations/etl', icon: 'repeat-line', text: 'ETL Jobs' },
        { path: '/data-analyst/integrations/api', icon: 'code-s-slash-line', text: 'API Manager' }
      ]
    },
    {
      path: '/data-analyst/ai-tools',
      icon: 'ai-line',
      text: 'AI Tools',
      children: [
        { path: '/data-analyst/ai-tools/predictive', icon: 'brain-line', text: 'Predictive Models' },
        { path: '/data-analyst/ai-tools/nlp', icon: 'text', text: 'NLP Analysis' },
        { path: '/data-analyst/ai-tools/anomaly', icon: 'alert-line', text: 'Anomaly Detection' }
      ]
    }
  ];

  return (
    <>
      <aside className="z-30 h-screen fixed bg-[#2E1B5B] inset-y-0 py-4 px-4 shadow-lg overflow-hidden w-64 border-r border-[#4A3B76] flex flex-col">
        {/* Logo Section */}
        <div className="mb-8 mt-2 h-12 flex items-center px-2 text-white font-bold text-xl">
          <i className="ri-bar-chart-box-line mr-2 text-[#FFD700]" />
          Data Lab
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
                          ? 'bg-[#1A1039] text-[#FFD700] shadow-md' 
                          : 'text-purple-100 hover:bg-[#1A1039] hover:text-white'
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
                                  ? 'bg-[#FFD700] text-[#2E1B5B] font-medium' 
                                  : 'text-purple-100 hover:bg-[#1A1039] hover:text-white'
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
        <div className="border-t border-[#4A3B76] pt-2 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-purple-100 hover:bg-[#1A1039] hover:text-[#FFD700] transition-colors duration-200 group rounded-lg"
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
          background: #4A3B76;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5A4B86;
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