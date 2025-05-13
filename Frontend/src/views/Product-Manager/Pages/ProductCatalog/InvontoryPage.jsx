// src/Pages/Dashboard/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiStoreLine, RiSearchLine } from 'react-icons/ri';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('http://localhost:3000/product-offerings');
        const data = await response.json();
        
        const inventoryData = data.map(item => ({
          key: item.sys_id,
          name: item.u_name,
          sku: item.u_external_id,
          category: item.u_category,
          price: parseFloat(item.u_price),
          stockLevel: Math.floor(Math.random() * 100),
          status: item.u_status,
          lastUpdated: item.sys_updated_on
        }));
        
        setInventory(inventoryData);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchText.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6EE7B7', '#7C3AED'];

  const handleRowClick = (productId) => {
    navigate(`/inventory/${productId}`);
  };

  return (
    <div className="min-h-screen bg-[#1F2937] text-gray-200 p-6">
      <div className="border-b border-[#374151] pb-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <RiStoreLine className="text-blue-400 mr-2" />
          Inventory Management
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor and manage your product inventory
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-[#111827] p-4 rounded-lg shadow">
          <div className="text-gray-400 text-sm">Total Products</div>
          <div className="text-2xl font-bold">{inventory.length}</div>
        </div>
        <div className="bg-[#111827] p-4 rounded-lg shadow">
          <div className="text-gray-400 text-sm">In Stock</div>
          <div className="text-2xl font-bold text-green-500">
            {inventory.filter(item => item.stockLevel > 0).length}
          </div>
        </div>
        <div className="bg-[#111827] p-4 rounded-lg shadow">
          <div className="text-gray-400 text-sm">Out of Stock</div>
          <div className="text-2xl font-bold text-red-500">
            {inventory.filter(item => item.stockLevel === 0).length}
          </div>
        </div>
        <div className="bg-[#111827] p-4 rounded-lg shadow">
          <div className="text-gray-400 text-sm">Avg. Stock Level</div>
          <div className="text-2xl font-bold">
            {inventory.length > 0 ? 
              Math.round(inventory.reduce((sum, item) => sum + item.stockLevel, 0) / inventory.length) : 
              0} units
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-[#111827] p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full md:w-64 bg-gray-800 border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex space-x-4">
            <button className="border border-[#374151] hover:border-blue-500 text-gray-300 hover:text-blue-400 px-4 py-2 rounded transition-colors">
              Export
            </button>
            <Link 
              to="/inventory/add-stock" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Add Stock
            </Link>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#111827] p-4 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock Level</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center">
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
                    <td className="p-3 text-gray-300">{item.sku}</td>
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
                    <td className="p-3 text-gray-300">${item.price.toFixed(2)}</td>
                    <td className="p-3">
                      <div className="w-32">
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full" 
                                style={{
                                  color: item.stockLevel > 30 ? '#10B981' : item.stockLevel > 10 ? '#F59E0B' : '#EF4444',
                                  backgroundColor: item.stockLevel > 30 ? '#10B98120' : item.stockLevel > 10 ? '#F59E0B20' : '#EF444420'
                                }}
                              >
                                {item.stockLevel} units
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800">
                            <div 
                              style={{
                                width: `${item.stockLevel}%`,
                                backgroundColor: item.stockLevel > 30 ? '#10B981' : item.stockLevel > 10 ? '#F59E0B' : '#EF4444'
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        item.status === 'active' ? 'bg-green-900 text-green-300' :
                        item.status === 'draft' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {item.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-3">
                        <button 
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle restock action
                          }}
                        >
                          Restock
                        </button>
                        <button 
                          className="text-gray-400 hover:text-gray-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle adjust action
                          }}
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-400">
                    No inventory items found matching your criteria
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