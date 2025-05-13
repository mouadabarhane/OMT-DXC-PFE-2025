// src/Pages/Dashboard/PricingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiMoneyDollarCircleLine, RiSearchLine, RiFilterLine } from 'react-icons/ri';

export default function PricingPage() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch('http://localhost:3000/product-offerings');
        const data = await response.json();
        
        const pricingData = data.map(item => ({
          key: item.sys_id,
          name: item.u_name,
          category: item.u_category,
          currentPrice: parseFloat(item.u_price),
          costPrice: parseFloat(item.u_price) * 0.7,
          margin: Math.floor(Math.random() * 50),
          marketSegment: item.u_market_segment || 'General',
          status: item.u_status,
          validFrom: item.u_valid_from,
          validTo: item.u_valid_to
        }));
        
        setPricing(pricingData);
      } catch (error) {
        console.error('Error fetching pricing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const categories = [...new Set(pricing.map(item => item.category))];
  
  const filteredPricing = pricing.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) &&
    (filterCategory === 'all' || item.category === filterCategory)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPricing.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPricing.length / itemsPerPage);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6EE7B7', '#7C3AED'];

  const handleRowClick = (productId) => {
    navigate(`/pricing/${productId}`);
  };

  return (
    <div className="min-h-screen bg-[#1F2937] text-gray-200 p-6">
      <div className="border-b border-[#374151] pb-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <RiMoneyDollarCircleLine className="text-blue-400 mr-2" />
          Pricing Management
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure and optimize your product pricing strategies
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-[#111827] p-4 rounded-lg shadow">
          <div className="text-gray-400 text-sm">Total Products</div>
          <div className="text-2xl font-bold">{pricing.length}</div>
        </div>
        <div className="bg-[#111827] p-4 rounded-lg shadow">
          <div className="text-gray-400 text-sm">Avg. Price</div>
          <div className="text-2xl font-bold">
            ${pricing.length > 0 ? 
              (pricing.reduce((sum, item) => sum + item.currentPrice, 0) / pricing.length).toFixed(2) : 
              '0.00'}
          </div>
        </div>
        <div className="bg-[#111827] p-4 rounded-lg shadow">
          <div className="text-gray-400 text-sm">Avg. Margin</div>
          <div className="text-2xl font-bold">
            {pricing.length > 0 ? 
              Math.round(pricing.reduce((sum, item) => sum + item.margin, 0) / pricing.length) : 
              0}%
          </div>
        </div>
        <div className="bg-[#111827] p-4 rounded-lg shadow">
          <div className="text-gray-400 text-sm">Active Promotions</div>
          <div className="text-2xl font-bold text-green-500">
            {pricing.filter(item => new Date(item.validTo) > new Date()).length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#111827] p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-gray-800 border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <RiFilterLine className="absolute left-3 top-3 text-gray-400" />
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex space-x-4">
            <button className="border border-[#374151] hover:border-blue-500 text-gray-300 hover:text-blue-400 px-4 py-2 rounded transition-colors">
              Bulk Update
            </button>
            <Link 
              to="/pricing/new-rule" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              New Price Rule
            </Link>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-[#111827] p-4 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Price</th>
                <th className="p-3">Cost Price</th>
                <th className="p-3">Margin</th>
                <th className="p-3">Segment</th>
                <th className="p-3">Valid Until</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center">
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr 
                    key={item.key} 
                    className="border-b border-gray-800 hover:bg-[#1F2937] transition-colors"
                  >
                    <td className="p-3 font-medium">
                      <div 
                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                        onClick={() => handleRowClick(item.key)}
                      >
                        {item.name}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 rounded-full text-xs" 
                        style={{
                          backgroundColor: COLORS[item.category ? item.category.charCodeAt(0) % COLORS.length : 0] + '20',
                          color: COLORS[item.category ? item.category.charCodeAt(0) % COLORS.length : 0]
                        }}
                      >
                        {item.category || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">${item.currentPrice.toFixed(2)}</td>
                    <td className="p-3 text-gray-300">${item.costPrice.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        item.margin > 25 ? 'bg-green-900 text-green-300' :
                        item.margin > 15 ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {item.margin}%
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{item.marketSegment}</td>
                    <td className="p-3 text-gray-400">
                      {item.validTo ? new Date(item.validTo).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-3">
                        <button 
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle adjust action
                          }}
                        >
                          Adjust
                        </button>
                        <button 
                          className="text-gray-400 hover:text-gray-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle history action
                          }}
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-400">
                    No pricing items found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-3 py-1">...</span>
              )}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}