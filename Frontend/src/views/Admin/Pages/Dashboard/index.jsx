import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie, Line, Scatter } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  // Color palette
  const colors = {
    primary: '#007B98',
    secondary: '#5BC0DE',
    success: '#5CB85C',
    warning: '#F0AD4E',
    danger: '#D9534F',
    info: '#5BC0DE',
    light: '#F8F9FA',
    dark: '#343A40'
  };

  // State management
  const [products, setProducts] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API calls
        const productsResponse = await fetch('http://localhost:3000/product-offerings');
        const productsData = await productsResponse.json();
        
        const specsResponse = await fetch('http://localhost:3000/product-specifications');
        const specsData = await specsResponse.json();
        
        setProducts(productsData);
        setSpecifications(specsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Data processing functions
  const getCategories = () => [...new Set(products.map(p => p.u_category))];
  const getMarketSegments = () => [...new Set(products.map(p => p.u_market_segment))];
  const getChannels = () => [...new Set(products.flatMap(p => p.u_channel ? p.u_channel.split(',').map(c => c.trim()) : []))];

  const filterProducts = () => {
    let filtered = [...products];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.u_category === selectedCategory);
    }
    return filtered;
  };

  const getPriceDistribution = () => {
    const prices = filterProducts().map(p => parseFloat(p.u_price));
    if (prices.length === 0) return [];
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const binSize = range / 10;
    
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${Math.floor(minPrice + i * binSize)}-${Math.floor(minPrice + (i + 1) * binSize)}`,
      count: 0
    }));
    
    prices.forEach(price => {
      const binIndex = Math.min(Math.floor((price - minPrice) / binSize), 9);
      bins[binIndex].count++;
    });
    
    return bins;
  };

  const getCreationTrend = () => {
    const filtered = filterProducts();
    const now = new Date();
    let dateGroups;
    
    if (timeRange === 'week') {
      dateGroups = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString(),
          count: 0
        };
      });
    } else if (timeRange === 'month') {
      dateGroups = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toLocaleDateString(),
          count: 0
        };
      });
    } else {
      dateGroups = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (11 - i));
        return {
          date: date.toLocaleDateString('default', { month: 'short' }),
          count: 0
        };
      });
    }
    
    filtered.forEach(product => {
      const createdDate = new Date(product.sys_created_on);
      let groupIndex;
      
      if (timeRange === 'week' || timeRange === 'month') {
        const dateStr = createdDate.toLocaleDateString();
        groupIndex = dateGroups.findIndex(g => g.date === dateStr);
      } else {
        const monthStr = createdDate.toLocaleDateString('default', { month: 'short' });
        groupIndex = dateGroups.findIndex(g => g.date === monthStr);
      }
      
      if (groupIndex !== -1) {
        dateGroups[groupIndex].count++;
      }
    });
    
    return dateGroups;
  };

  const getStatusData = () => {
    const statusCounts = filterProducts().reduce((acc, product) => {
      acc[product.u_status] = (acc[product.u_status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  };

  const getSpecsByVersion = () => {
    const versionCounts = specifications.reduce((acc, spec) => {
      const version = spec.u_version || 'Unversioned';
      acc[version] = (acc[version] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(versionCounts).map(([version, count]) => ({ version, count }));
  };

  const getValidityData = () => {
    const now = new Date();
    return {
      active: filterProducts().filter(p => new Date(p.u_valid_from) <= now && new Date(p.u_valid_to) >= now).length,
      upcoming: filterProducts().filter(p => new Date(p.u_valid_from) > now).length,
      expired: filterProducts().filter(p => new Date(p.u_valid_to) < now).length
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#007B98] mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#007B98] text-white rounded hover:bg-[#006884] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#007B98]">Product Management Dashboard</h1>
            <p className="text-gray-600">Comprehensive overview of your product offerings and specifications</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded border-gray-300 text-sm focus:border-[#007B98] focus:ring-[#007B98]"
            >
              <option value="all">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded border-gray-300 text-sm focus:border-[#007B98] focus:ring-[#007B98]"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
          {['overview', 'products', 'specs', 'analytics', 'insights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab 
                  ? 'bg-[#007B98] text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#007B98] hover:shadow-lg transition">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#007B98]/10 mr-4">
                  <svg className="w-6 h-6 text-[#007B98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{filterProducts().length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#5BC0DE] hover:shadow-lg transition">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#5BC0DE]/10 mr-4">
                  <svg className="w-6 h-6 text-[#5BC0DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Specifications</p>
                  <p className="text-2xl font-bold text-gray-900">{specifications.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#5CB85C] hover:shadow-lg transition">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#5CB85C]/10 mr-4">
                  <svg className="w-6 h-6 text-[#5CB85C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filterProducts().filter(p => p.u_status === 'available').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#F0AD4E] hover:shadow-lg transition">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#F0AD4E]/10 mr-4">
                  <svg className="w-6 h-6 text-[#F0AD4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{getCategories().length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Distribution Histogram */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Price Distribution</h3>
                <div className="flex space-x-2">
                  <button className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">Linear</button>
                  <button className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">Log</button>
                </div>
              </div>
              <div className="h-80">
                <Bar
                  data={{
                    labels: getPriceDistribution().map(bin => bin.range),
                    datasets: [{
                      label: 'Number of Products',
                      data: getPriceDistribution().map(bin => bin.count),
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Products'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Price Range ($)'
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Products by Category</h3>
              <div className="h-80">
                <Bar
                  data={{
                    labels: getCategories(),
                    datasets: [{
                      label: 'Products',
                      data: getCategories().map(cat => 
                        filterProducts().filter(p => p.u_category === cat).length
                      ),
                      backgroundColor: [
                        colors.primary,
                        colors.secondary,
                        colors.success,
                        colors.warning,
                        colors.danger,
                        colors.info,
                        colors.dark
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Products'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Category'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Secondary Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
              <div className="h-64">
                <Pie
                  data={{
                    labels: getStatusData().map(item => item.status),
                    datasets: [{
                      data: getStatusData().map(item => item.count),
                      backgroundColor: [
                        colors.success,
                        colors.danger,
                        colors.warning,
                        colors.info
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right'
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Creation Trend */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Product Creation Trend</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setTimeRange('week')}
                    className={`px-2 py-1 text-xs rounded ${timeRange === 'week' ? 'bg-[#007B98] text-white' : 'bg-gray-100'}`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setTimeRange('month')}
                    className={`px-2 py-1 text-xs rounded ${timeRange === 'month' ? 'bg-[#007B98] text-white' : 'bg-gray-100'}`}
                  >
                    Month
                  </button>
                  <button 
                    onClick={() => setTimeRange('year')}
                    className={`px-2 py-1 text-xs rounded ${timeRange === 'year' ? 'bg-[#007B98] text-white' : 'bg-gray-100'}`}
                  >
                    Year
                  </button>
                </div>
              </div>
              <div className="h-64">
                <Line
                  data={{
                    labels: getCreationTrend().map(item => item.date),
                    datasets: [{
                      label: 'Products Created',
                      data: getCreationTrend().map(item => item.count),
                      borderColor: colors.primary,
                      backgroundColor: `${colors.primary}40`,
                      tension: 0.3,
                      fill: true
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Products'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: timeRange === 'year' ? 'Month' : 'Date'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Validity Status */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Validity Status</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ['Active', 'Upcoming', 'Expired'],
                    datasets: [{
                      label: 'Products',
                      data: [
                        getValidityData().active,
                        getValidityData().upcoming,
                        getValidityData().expired
                      ],
                      backgroundColor: [
                        colors.success,
                        colors.info,
                        colors.danger
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Products'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Validity Status'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Product Offerings</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-[#007B98] text-white text-sm rounded hover:bg-[#006884] transition">
                Export
              </button>
              <button className="px-3 py-1 border border-[#007B98] text-[#007B98] text-sm rounded hover:bg-[#007B98]/10 transition">
                Add Product
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> 
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filterProducts().map((product) => (
                  <tr key={product.sys_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#007B98]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#007B98] font-medium">
                            {product.u_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#007B98]">{product.u_name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1" dangerouslySetInnerHTML={{ __html: product.u_description }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.u_category}</div>
                    </td>
                
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${product.u_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.u_status}
                      </span>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
              <span className="font-medium">{filterProducts().length}</span> results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 bg-gray-100 text-sm rounded">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specifications Tab */}
      {activeTab === 'specs' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Product Specifications</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-[#007B98] text-white text-sm rounded hover:bg-[#006884] transition">
                Export
              </button>
              <button className="px-3 py-1 border border-[#007B98] text-[#007B98] text-sm rounded hover:bg-[#007B98]/10 transition">
                Add Specification
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">External ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {specifications.map((spec) => (
                  <tr key={spec.sys_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#5BC0DE]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#5BC0DE] font-medium">
                            {spec.u_name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#5BC0DE]">{spec.u_name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{spec.u_description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {spec.u_version || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {spec.u_external_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(spec.u_valid_from).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(spec.u_valid_to).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"> 
                    {spec.sys_created_by || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
              <span className="font-medium">{specifications.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 bg-gray-100 text-sm rounded">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Segment Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Market Segment Distribution</h3>
              <div className="h-80">
                <Bar
                  data={{
                    labels: getMarketSegments(),
                    datasets: [{
                      label: 'Products',
                      data: getMarketSegments().map(segment => 
                        filterProducts().filter(p => p.u_market_segment === segment).length
                      ),
                      backgroundColor: [
                        colors.primary,
                        colors.secondary,
                        colors.success,
                        colors.warning
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Products'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Market Segment'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Channel Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Channel Distribution</h3>
              <div className="h-80">
                <Pie
                  data={{
                    labels: getChannels(),
                    datasets: [{
                      data: getChannels().map(channel => 
                        filterProducts().filter(p => 
                          p.u_channel && p.u_channel.includes(channel)
                        ).length
                      ),
                      backgroundColor: [
                        colors.primary,
                        colors.secondary,
                        colors.success,
                        colors.warning,
                        colors.danger
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right'
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Specifications by Version */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Specifications by Version</h3>
              <div className="h-80">
                <Bar
                  data={{
                    labels: getSpecsByVersion().map(item => item.version),
                    datasets: [{
                      label: 'Specifications',
                      data: getSpecsByVersion().map(item => item.count),
                      backgroundColor: colors.info,
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Specifications'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Version'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Price vs. Validity Duration */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Price vs. Validity Duration</h3>
              <div className="h-80">
                <Scatter
                  data={{
                    datasets: [{
                      label: 'Products',
                      data: filterProducts().map(product => ({
                        x: parseFloat(product.u_price),
                        y: (new Date(product.u_valid_to) - new Date(product.u_valid_from)) / (1000 * 60 * 60 * 24)
                      })),
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                      borderWidth: 1,
                      pointRadius: 6,
                      pointHoverRadius: 8
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'Validity Duration (days)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Price ($)'
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const product = filterProducts()[context.dataIndex];
                            return [
                              `Product: ${product.u_name}`,
                              `Price: $${product.u_price}`,
                              `Valid: ${new Date(product.u_valid_from).toLocaleDateString()} - ${new Date(product.u_valid_to).toLocaleDateString()}`,
                              `Duration: ${context.parsed.y} days`
                            ];
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products by Price */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Products by Price</h3>
              <div className="space-y-4">
                {[...filterProducts()]
                  .sort((a, b) => parseFloat(b.u_price) - parseFloat(a.u_price))
                  .slice(0, 5)
                  .map((product, index) => (
                    <div key={product.sys_id} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        index === 0 ? 'bg-[#F0AD4E]/20 text-[#F0AD4E]' : 
                        index === 1 ? 'bg-[#5BC0DE]/20 text-[#5BC0DE]' : 
                        index === 2 ? 'bg-[#5CB85C]/20 text-[#5CB85C]' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{product.u_name}</div>
                        <div className="text-xs text-gray-500">{product.u_category}</div>
                      </div>
                      <div className="text-sm font-bold text-[#007B98]">${product.u_price}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recently Added */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recently Added Products</h3>
              <div className="space-y-4">
                {[...filterProducts()]
                  .sort((a, b) => new Date(b.sys_created_on) - new Date(a.sys_created_on))
                  .slice(0, 5)
                  .map(product => (
                    <div key={product.sys_id} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#007B98]/10 flex items-center justify-center mr-3">
                        <span className="text-[#007B98] text-xs">
                          {new Date(product.sys_created_on).toLocaleDateString('default', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.u_name}</div>
                        <div className="text-xs text-gray-500">
                          Added by {product.sys_created_by}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        product.u_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.u_status}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Expiring Soon */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Expiring Soon</h3>
              <div className="space-y-4">
                {[...filterProducts()]
                  .filter(p => new Date(p.u_valid_to) > new Date())
                  .sort((a, b) => new Date(a.u_valid_to) - new Date(b.u_valid_to))
                  .slice(0, 5)
                  .map(product => {
                    const daysLeft = Math.ceil((new Date(product.u_valid_to) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={product.sys_id} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          daysLeft <= 30 ? 'bg-[#D9534F]/20 text-[#D9534F]' : 
                          daysLeft <= 90 ? 'bg-[#F0AD4E]/20 text-[#F0AD4E]' : 
                          'bg-[#5CB85C]/20 text-[#5CB85C]'
                        }`}>
                          {daysLeft}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{product.u_name}</div>
                          <div className="text-xs text-gray-500">
                            Expires on {new Date(product.u_valid_to).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {daysLeft <= 30 ? 'Urgent' : daysLeft <= 90 ? 'Soon' : 'Safe'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Data Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Average Price</div>
                <div className="text-2xl font-bold text-[#007B98]">
                  ${(filterProducts().reduce((sum, p) => sum + parseFloat(p.u_price), 0) / filterProducts().length).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Across all products</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Average Validity</div>
                <div className="text-2xl font-bold text-[#5BC0DE]">
                  {Math.round(filterProducts().reduce((sum, p) => {
                    const days = (new Date(p.u_valid_to) - new Date(p.u_valid_from)) / (1000 * 60 * 60 * 24);
                    return sum + days;
                  }, 0) / filterProducts().length)} days
                </div>
                <div className="text-xs text-gray-500 mt-1">Average duration</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Most Common Category</div>
                <div className="text-2xl font-bold text-[#5CB85C]">
                  {getCategories().reduce((a, b) => 
                    filterProducts().filter(p => p.u_category === a).length > 
                    filterProducts().filter(p => p.u_category === b).length ? a : b
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.max(...getCategories().map(c => 
                    filterProducts().filter(p => p.u_category === c).length
                  ))} products
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Most Active Creator</div>
                <div className="text-2xl font-bold text-[#F0AD4E]">
                  {[...new Set(filterProducts().map(p => p.sys_created_by))].reduce((a, b) => 
                    filterProducts().filter(p => p.sys_created_by === a).length > 
                    filterProducts().filter(p => p.sys_created_by === b).length ? a : b
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.max(...[...new Set(filterProducts().map(p => p.sys_created_by))].map(u => 
                    filterProducts().filter(p => p.sys_created_by === u).length
                  ))} products
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}