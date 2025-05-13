const ActivitySidebar = ({ products = [], specs = [] }) => {
  // Combine and sort activities
  const recentActivities = [...products, ...specs]
    .sort((a, b) => new Date(b.sys_updated_on) - new Date(a.sys_updated_on))
    .slice(0, 5);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats
  const activeProducts = products.filter(p => 
    p.u_status === 'active' || p.u_status === 'available'
  ).length;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 h-full flex flex-col gap-6">
      {/* Recent Activity Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
        <h3 className="relative text-2xl font-bold text-[#0098C2] mb-6 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-[#0098C2] after:rounded-full">
        Recent Activity            </h3>
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
            {recentActivities.length} updates
          </span>
        </div>
        
        <div className="space-y-3">
          {recentActivities.map(item => (
            <div key={item.sys_id} className="group p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-start gap-3">
                <div className={`mt-1 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                  ${item.sys_created_on === item.sys_updated_on ? 
                    'bg-green-50 text-green-600' : 
                    'bg-blue-50 text-blue-600'}`}>
                  {item.sys_created_on === item.sys_updated_on ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.u_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(item.sys_updated_on)}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    
                    <span className="text-xs text-gray-400">
                     by {item.sys_updated_by}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Products</p>
                <p className="font-semibold text-gray-800">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active</p>
                <p className="font-semibold text-gray-800">{activeProducts}</p>
              </div>
            </div>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default ActivitySidebar;