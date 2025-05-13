// src/Pages/Dashboard/ProductOfferingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  RiProductHuntLine, 
  RiSearchLine, 
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiTimerLine,
  RiArchiveLine
} from 'react-icons/ri';

export default function ProductOfferingsPage() {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const response = await fetch('http://localhost:3000/product-offerings');
        if (!response.ok) throw new Error('Failed to fetch offerings');
        const data = await response.json();
        setOfferings(data);
      } catch (error) {
        console.error('Error fetching offerings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferings();
  }, []);

  const filteredOfferings = offerings.filter(offering =>
    offering.u_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    offering.u_description?.toLowerCase().includes(searchText.toLowerCase()) ||
    offering.u_external_id?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOfferings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOfferings.length / itemsPerPage);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6EE7B7', '#7C3AED'];

  const handleRowClick = (offeringId) => {
    navigate(`/offerings/${offeringId}`);
  };

  const getStatusTag = (status) => {
    switch(status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900 text-green-300">
            <RiCheckLine className="mr-1" /> ACTIVE
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
            <RiCloseLine className="mr-1" /> INACTIVE
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-900 text-blue-300">
            <RiTimerLine className="mr-1" /> PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-900 text-yellow-300">
            UNKNOWN
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#1F2937] text-gray-200 p-6">
      <div className="border-b border-[#374151] pb-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <RiProductHuntLine className="text-blue-400 mr-2" />
          Product Offerings
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage and organize your product offerings
        </p>
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
          <div className="text-gray-400 text-sm">Average Price</div>
          <div className="text-2xl font-bold">
            ${offerings.length > 0 ? 
              (offerings.reduce((sum, o) => sum + parseFloat(o.u_price || 0), 0) / offerings.length).toFixed(2) : 
              '0.00'}
          </div>
        </div>
        <div className="bg-[#111827] p-4 rounded-lg shadow">
          <div className="text-gray-400 text-sm">Categories</div>
          <div className="text-2xl font-bold">
            {[...new Set(offerings.map(o => o.u_category))].length}
          </div>
        </div>
      </div>
      <div className="bg-[#111827] p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search offerings..."
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
              to="/offerings/new" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center"
            >
              <RiAddLine className="mr-1" />
              New Offering
            </Link>
          </div>
        </div>
      </div>

      {/* Offerings Table */}
      <div className="bg-[#111827] p-4 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="p-3">Offering Name</th>
                <th className="p-3">Description</th>
                <th className="p-3">Price</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center">
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((offering) => (
                  <tr 
                    key={offering.sys_id} 
                    className="border-b border-gray-800 hover:bg-[#1F2937] transition-colors"
                  >
                    <td className="p-3 font-medium">
                      <div 
                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                        onClick={() => handleRowClick(offering.sys_id)}
                      >
                        {offering.u_name}
                      </div>
                    </td>
                    <td className="p-3 text-gray-300">
                      {offering.u_description?.length > 50 
                        ? `${offering.u_description.substring(0, 50)}...` 
                        : offering.u_description}
                    </td>
                    <td className="p-3">
                      ${parseFloat(offering.u_price || 0).toFixed(2)} <span className="text-xs text-gray-400">{offering.u_unit_of_measure}</span>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-900/30 text-blue-300">
                        {offering.u_category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-3">
                      {getStatusTag(offering.u_status)}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-3">
                        <button 
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/offerings/${offering.sys_id}/edit`);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-gray-400 hover:text-gray-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/offerings/${offering.sys_id}/specs`);
                          }}
                        >
                          View Specs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-400">
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
    </div>
  );
}