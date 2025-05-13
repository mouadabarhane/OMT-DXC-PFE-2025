import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaCheck, FaTimes } from 'react-icons/fa';

const ProductSpecification = () => {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    const fetchSpecifications = async () => {
      try {
        const response = await axios.get('http://localhost:3000/product-specifications');
        setSpecs(response.data);
      } catch (err) {
        setError('Failed to fetch product specifications. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecifications();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting and filtering
  const filteredAndSortedSpecs = React.useMemo(() => {
    let filtered = specs.filter(spec =>
      spec.u_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.u_description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [specs, searchQuery, sortConfig]);

  // Pagination logic
  const indexOfLastSpec = currentPage * productsPerPage;
  const indexOfFirstSpec = indexOfLastSpec - productsPerPage;
  const currentSpecs = filteredAndSortedSpecs.slice(indexOfFirstSpec, indexOfLastSpec);
  const totalPages = Math.ceil(filteredAndSortedSpecs.length / productsPerPage);

  // Change page
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  // Edit functions
  const handleEditClick = (spec) => {
    setEditingId(spec.sys_id);
    setEditFormData({
      u_name: spec.u_name,
      u_version: spec.u_version,
      u_description: spec.u_description,
      u_external_id: spec.u_external_id,
      u_valid_from: spec.u_valid_from,
      u_valid_to: spec.u_valid_to
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (id) => {
    try {
      await axios.put(`http://localhost:3000/product-specifications/${id}`, editFormData);
      setSpecs(specs.map(spec => 
        spec.sys_id === id ? { ...spec, ...editFormData } : spec
      ));
      setEditingId(null);
    } catch (err) {
      setError('Failed to update specification');
      console.error('Update error:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Delete functions
  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/product-specifications/${id}`);
      setSpecs(specs.filter(spec => spec.sys_id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      setError('Failed to delete specification');
      console.error('Delete error:', err);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="mt-4 text-lg font-medium text-gray-600">Loading specifications...</span>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>

          <p className="text-sm text-gray-500 mt-1">
            {filteredAndSortedSpecs.length} total specifications
          </p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search specifications..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('u_name')}
              >
                <div className="flex items-center">
                  Name
                  <span className="ml-1 text-gray-400">{renderSortIndicator('u_name')}</span>
                </div>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('u_version')}
              >
                <div className="flex items-center">
                  Version
                  <span className="ml-1 text-gray-400">{renderSortIndicator('u_version')}</span>
                </div>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Description
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                External ID
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('sys_created_on')}
              >
                <div className="flex items-center">
                  Created
                  <span className="ml-1 text-gray-400">{renderSortIndicator('sys_created_on')}</span>
                </div>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('u_valid_from')}
              >
                <div className="flex items-center">
                  Valid From
                  <span className="ml-1 text-gray-400">{renderSortIndicator('u_valid_from')}</span>
                </div>
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('u_valid_to')}
              >
                <div className="flex items-center">
                  Valid To
                  <span className="ml-1 text-gray-400">{renderSortIndicator('u_valid_to')}</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentSpecs.length > 0 ? (
              currentSpecs.map((spec) => (
                <tr key={spec.sys_id} className="hover:bg-gray-50 transition-colors duration-150">
                  {editingId === spec.sys_id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="u_name"
                          value={editFormData.u_name}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="u_version"
                          value={editFormData.u_version}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <textarea
                          name="u_description"
                          value={editFormData.u_description}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          rows="2"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="u_external_id"
                          value={editFormData.u_external_id}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-[#0098C2] focus:border-[#0098C2]-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(spec.sys_created_on)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          name="u_valid_from"
                          value={editFormData.u_valid_from}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          name="u_valid_to"
                          value={editFormData.u_valid_to}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditSubmit(spec.sys_id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                            title="Save changes"
                          >
                            <FaCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                            title="Cancel editing"
                          >
                            <FaTimes className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{spec.u_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {spec.u_version}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: spec.u_description }} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {spec.u_external_id || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(spec.sys_created_on)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(spec.u_valid_from)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(spec.u_valid_to)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(spec)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                            title="Edit specification"
                          >
                            <FiEdit className="h-5 w-5" />
                          </button>
                          {deleteConfirmId === spec.sys_id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => confirmDelete(spec.sys_id)}
                                className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                                title="Confirm deletion"
                              >
                                <FaCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={cancelDelete}
                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                                title="Cancel deletion"
                              >
                                <FaTimes className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeleteClick(spec.sys_id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                              title="Delete specification"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  No specifications found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

{/* Pagination - Centered */}
<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
  <div className="flex items-center space-x-2">
    <button
      onClick={prevPage}
      disabled={currentPage === 1}
      className={`p-2 rounded-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
    >
      <FiChevronLeft className="h-5 w-5" />
    </button>
    
    <div className="flex items-center space-x-1">
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
            onClick={() => goToPage(pageNum)}
            className={`w-10 h-10 flex items-center justify-center rounded-md border text-sm font-medium ${currentPage === pageNum ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
          >
            {pageNum}
          </button>
        );
      })}
    </div>
    
    <button
      onClick={nextPage}
      disabled={currentPage === totalPages}
      className={`p-2 rounded-md border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
    >
      <FiChevronRight className="h-5 w-5" />
    </button>
  </div>
 </div>
    </div>
  );
};

export default ProductSpecification;