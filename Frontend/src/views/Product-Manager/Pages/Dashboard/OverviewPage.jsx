import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Legend, LineChart, Line 
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

function ProductOfferings() {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'u_name', direction: 'asc' });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch product offerings data
    axios.get('http://localhost:3000/product-offerings')
      .then(response => {
        setOfferings(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching product offerings:', error);
        setLoading(false);
      });
  }, []);

  // Prepare data for visualizations
  const categoryData = offerings.reduce((acc, curr) => {
    const category = curr.u_category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const statusData = offerings.reduce((acc, curr) => {
    const status = curr.u_status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Price distribution data
  const priceRanges = [
    { name: '$0-$50', min: 0, max: 50 },
    { name: '$50-$100', min: 50, max: 100 },
    { name: '$100-$200', min: 100, max: 200 },
    { name: '$200+', min: 200, max: Infinity }
  ];

  const priceData = priceRanges.map(range => {
    const count = offerings.filter(o => {
      const price = parseFloat(o.u_price) || 0;
      return price >= range.min && price < range.max;
    }).length;
    return { name: range.name, value: count };
  });

  // Validity timeline data (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const timelineData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    const activeCount = offerings.filter(o => {
      const validFrom = new Date(o.u_valid_from);
      const validTo = new Date(o.u_valid_to);
      return validFrom <= monthEnd && validTo >= monthStart;
    }).length;
    
    return {
      name: `${monthNames[month]} ${year}`,
      active: activeCount,
      new: offerings.filter(o => {
        const validFrom = new Date(o.u_valid_from);
        return validFrom.getMonth() === month && validFrom.getFullYear() === year;
      }).length
    };
  });

  const categoryChartData = Object.entries(categoryData).map(([key, value]) => ({ name: key, value }));
  const statusChartData = Object.entries(statusData).map(([key, value]) => ({ name: key, value }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6EE7B7', '#7C3AED'];

  // Filter and sort offerings
  const filteredOfferings = offerings.filter(offering => {
    const matchesSearch = offering.u_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         offering.u_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || offering.u_category === filterCategory;
    const matchesStatus = filterStatus === 'All' || offering.u_status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedOfferings = [...filteredOfferings].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOfferings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOfferings.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get unique categories and statuses for filters
  const uniqueCategories = [...new Set(offerings.map(o => o.u_category).filter(Boolean))];
  const uniqueStatuses = [...new Set(offerings.map(o => o.u_status).filter(Boolean))];

  const handleRowClick = (offeringId) => {
    navigate(`/offerings/${offeringId}`);
  };

  return (
    <div className="min-h-screen bg-[#1F2937] text-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Offerings Dashboard</h1>
        <Link 
          to="/product-manager/offerings/manage" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add New Offering
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Filters and Search */}
          <div className="bg-[#111827] p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search offerings..."
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('All');
                    setFilterStatus('All');
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-[#111827] p-4 rounded-lg shadow">
              <div className="text-gray-400 text-sm">Total Offerings</div>
              <div className="text-2xl font-bold">{offerings.length}</div>
            </div>
            <div className="bg-[#111827] p-4 rounded-lg shadow">
              <div className="text-gray-400 text-sm">Active Offerings</div>
              <div className="text-2xl font-bold text-green-500">
                {offerings.filter(o => o.u_status === 'active').length}
              </div>
            </div>
            <div className="bg-[#111827] p-4 rounded-lg shadow">
              <div className="text-gray-400 text-sm">Categories</div>
              <div className="text-2xl font-bold">{uniqueCategories.length}</div>
            </div>
            <div className="bg-[#111827] p-4 rounded-lg shadow">
              <div className="text-gray-400 text-sm">Avg. Price</div>
              <div className="text-2xl font-bold">
                ${(offerings.reduce((sum, o) => sum + (parseFloat(o.u_price) || 0), 0) / offerings.length).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Category Distribution Pie Chart */}
            <div className="bg-[#111827] p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Offerings by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} offerings`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution Bar Chart */}
            <div className="bg-[#111827] p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Offerings by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip 
                    formatter={(value) => [`${value} offerings`, 'Count']}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Count"
                    radius={[4, 4, 0, 0]}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Price Distribution Bar Chart */}
            <div className="bg-[#111827] p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Price Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceData}>
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip 
                    formatter={(value) => [`${value} offerings`, 'Count']}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Count"
                    radius={[4, 4, 0, 0]}
                  >
                    {priceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Timeline Chart */}
            <div className="bg-[#111827] p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Offerings Timeline (Last 6 Months)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    name="Active Offerings" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="new" 
                    name="New Offerings" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Offerings Table */}
          <div className="bg-[#111827] p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Offerings List</h2>
              <div className="text-sm text-gray-400">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedOfferings.length)} of {sortedOfferings.length} offerings
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="p-2">Image</th>
                    <th 
                      className="p-2 cursor-pointer hover:bg-gray-800 transition-colors"
                      onClick={() => requestSort('u_name')}
                    >
                      Name {sortConfig.key === 'u_name' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="p-2 cursor-pointer hover:bg-gray-800 transition-colors"
                      onClick={() => requestSort('u_category')}
                    >
                      Category {sortConfig.key === 'u_category' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="p-2 cursor-pointer hover:bg-gray-800 transition-colors"
                      onClick={() => requestSort('u_price')}
                    >
                      Price {sortConfig.key === 'u_price' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="p-2 cursor-pointer hover:bg-gray-800 transition-colors"
                      onClick={() => requestSort('u_status')}
                    >
                      Status {sortConfig.key === 'u_status' && (
                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-2">Valid From</th>
                    <th className="p-2">Valid To</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((offering) => (
                      <tr 
                        key={offering.sys_id} 
                        className="border-b border-gray-800 hover:bg-[#1F2937] transition-colors cursor-pointer"
                        onClick={() => handleRowClick(offering.sys_id)}
                      >
                        <td className="p-2">
                          {offering.u_image_url ? (
                            <img 
                              src={offering.u_image_url} 
                              alt={offering.u_name} 
                              className="w-12 h-12 object-cover rounded" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/48';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                              N/A
                            </div>
                          )}
                        </td>
                        <td className="p-2 font-medium">
                          <div className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                            {offering.u_name}
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="inline-block px-2 py-1 rounded-full text-xs" 
                            style={{
                              backgroundColor: COLORS[uniqueCategories.indexOf(offering.u_category) % COLORS.length] + '20',
                              color: COLORS[uniqueCategories.indexOf(offering.u_category) % COLORS.length]
                            }}
                          >
                            {offering.u_category || 'N/A'}
                          </span>
                        </td>
                        <td className="p-2">${parseFloat(offering.u_price || '0').toFixed(2)}</td>
                        <td className="p-2 capitalize">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            offering.u_status === 'active' ? 'bg-green-900 text-green-300' :
                            offering.u_status === 'draft' ? 'bg-yellow-900 text-yellow-300' :
                            offering.u_status === 'expired' ? 'bg-red-900 text-red-300' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {offering.u_status || 'Unknown'}
                          </span>
                        </td>
                        <td className="p-2">{offering.u_valid_from ? new Date(offering.u_valid_from).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-2">{offering.u_valid_to ? new Date(offering.u_valid_to).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-400">
                        No offerings found matching your criteria
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
        </>
      )}
    </div>
  );
}

export default ProductOfferings;