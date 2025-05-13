import { FiSmartphone, FiWifi, FiGlobe, FiBriefcase, FiShoppingBag, FiTag, FiChevronDown, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { useState} from 'react';

const SidebarCategories = ({ products = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const totalAvailable = products.filter(p => p.u_status === 'available' || p.u_status === 'active').length;

  // Category icons mapping
  const categoryIcons = {
    'Smartphones': <FiSmartphone className="text-blue-500" size={14} />,
    'Mobile Plan': <FiWifi className="text-green-500" size={14} />,
    'Short-Term Plan': <FiGlobe className="text-purple-500" size={14} />,
    'Professional': <FiBriefcase className="text-amber-500" size={14} />,
    'default': <FiShoppingBag className="text-gray-500" size={14} />
  };

  // Calculate category statistics
  const categoryStats = products.reduce((acc, product) => {
    const category = product.u_category || 'Uncategorized';
    if (!acc[category]) acc[category] = { count: 0, available: 0, products: [] };
    acc[category].count++;
    if (product.u_status === 'available' || product.u_status === 'active') acc[category].available++;
    acc[category].products.push(product);
    return acc;
  }, {});

  // Sort and filter categories
  const sortedCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1].count - a[1].count)
    .filter(([category]) => category.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
      {/* Compact Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
        <h3 className="relative text-2xl font-bold text-[#0098C2] mb-6 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-[#0098C2] after:rounded-full">
        Product Catalog
            </h3>
          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex items-center">
            <FiCheckCircle className="mr-1" size={10} />
            {totalAvailable}/{products.length}
          </span>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-2 top-2.5 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Compact Categories List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sortedCategories.map(([category, stats]) => (
          <div key={category} className="border border-gray-100 rounded-lg">
            <div 
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
            >
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-white rounded-md border border-gray-100">
                  {categoryIcons[category] || categoryIcons['default']}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{category}</p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      {stats.available} available
                    </span>
                    <span className="text-xs text-gray-500">{stats.count} items</span>
                  </div>
                </div>
              </div>
              <FiChevronDown className={`text-gray-400 ${expandedCategory === category ? 'transform rotate-180' : ''}`} size={14} />
            </div>

            {expandedCategory === category && (
              <div className="pl-11 pr-2 pb-1 space-y-1">
                {stats.products.slice(0, 3).map(product => (
                  <div key={product.sys_id} className="flex items-center justify-between py-1 px-2 text-sm">
                    <div className="flex items-center space-x-1.5 truncate">
                      <FiTag className="text-gray-400 flex-shrink-0" size={12} />
                      <span className="truncate">{product.u_name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        product.u_status === 'available' ? 'bg-green-100 text-green-800' : 
                        product.u_status === 'active' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.u_status}
                      </span>
                      <span className="text-xs font-medium">${parseFloat(product.u_price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                {stats.products.length > 3 && (
                  <div className="text-xs text-blue-600 px-2 py-0.5">+ {stats.products.length - 3} more</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Compact Footer */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between text-xs">
          <div className="text-center px-2 py-1">
            <p className="font-medium">{sortedCategories.length}</p>
            <p className="text-gray-500">Categories</p>
          </div>
          <div className="text-center px-2 py-1">
            <p className="font-medium">{totalAvailable}</p>
            <p className="text-gray-500">Available</p>
          </div>
          <div className="text-center px-2 py-1">
            <p className="font-medium">
              {products.length > 0 ? Math.round((totalAvailable / products.length) * 100) : 0}%
            </p>
            <p className="text-gray-500">In Stock</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarCategories;