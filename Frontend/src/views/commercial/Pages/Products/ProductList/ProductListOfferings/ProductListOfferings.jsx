import { useEffect, useState } from 'react';
import axios from 'axios';

const ProductListOffering = () => {
  const [specs, setSpecs] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSpec, setExpandedSpec] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [offeringSearchTerm, setOfferingSearchTerm] = useState('');
  const [offeringCurrentPage, setOfferingCurrentPage] = useState(1);
  const [editingOffering, setEditingOffering] = useState(null);
  const [editFormData, setEditFormData] = useState({
    u_name: '',
    u_price: '',
    u_status: 'Active'
  });

  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes, offerRes] = await Promise.all([
          axios.get('http://localhost:3000/product-specifications'),
          axios.get('http://localhost:3000/product-offerings')
        ]);

        setSpecs(specRes.data.result || specRes.data);
        setOfferings(offerRes.data.result || offerRes.data);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSpec = (specId) => {
    setExpandedSpec(expandedSpec === specId ? null : specId);
    setOfferingCurrentPage(1);
    setOfferingSearchTerm('');
  };

  const handleEditClick = (offering) => {
    setEditingOffering(offering.sys_id);
    setEditFormData({
      u_name: offering.u_name || '',
      u_price: offering.u_price || '',
      u_status: offering.u_status || 'Active'
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleUpdateOffering = async (u_category) => {
    try {
      await axios.put(`http://localhost:3000/product-offerings/${u_category}`, editFormData);
      const updatedOfferings = offerings.map(offering => 
        offering.sys_id === u_category ? { ...offering, ...editFormData } : offering
      );
      setOfferings(updatedOfferings);
      setEditingOffering(null);
    } catch (err) {
      console.error('Error updating offering:', err);
      setError('Failed to update offering.');
    }
  };

  const handleDeleteOffering = async (u_category) => {
    if (window.confirm('Are you sure you want to delete this offering?')) {
      try {
        await axios.delete(`http://localhost:3000/product-offerings/${u_category}`);
        const updatedOfferings = offerings.filter(offering => offering.sys_id !== u_category);
        setOfferings(updatedOfferings);
      } catch (err) {
        console.error('Error deleting offering:', err);
        setError('Failed to delete offering.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisiblePages = (current, total) => {
    if (total <= 1) return [];
    const visiblePages = [];
    if (current > 2) {
      visiblePages.push(1);
      if (current > 3) visiblePages.push('...');
    }
    for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) {
      visiblePages.push(i);
    }
    if (current < total - 1) {
      if (current < total - 2) visiblePages.push('...');
      visiblePages.push(total);
    }
    return visiblePages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md rounded-lg shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const groupedData = specs.map(spec => {
    const relatedOfferings = offerings.filter(
      o => o.u_product_specification?.value === spec.sys_id
    );
    return { ...spec, offerings: relatedOfferings };
  }).sort((a, b) => (a.u_name || '').localeCompare(b.u_name || ''));

  const filteredData = groupedData.filter(spec => 
    spec.u_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.u_external_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.sys_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const currentSpec = expandedSpec ? groupedData.find(spec => spec.sys_id === expandedSpec) : null;
  const filteredOfferings = currentSpec ? 
    currentSpec.offerings.filter(offering => 
      offering.u_name?.toLowerCase().includes(offeringSearchTerm.toLowerCase()) ||
      offering.sys_id?.toLowerCase().includes(offeringSearchTerm.toLowerCase())
    ) : [];
  const offeringsTotalPages = Math.ceil(filteredOfferings.length / ITEMS_PER_PAGE);
  const paginatedOfferings = filteredOfferings.slice(
    (offeringCurrentPage - 1) * ITEMS_PER_PAGE,
    offeringCurrentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, ID or external ID..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {paginatedData.length > 0 ? (
            paginatedData.map((spec) => (
              <div key={spec.sys_id} className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-lg">
                <div 
                  className={`p-6 cursor-pointer ${expandedSpec === spec.sys_id ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : 'hover:bg-gray-50'} transition-colors duration-200`}
                  onClick={() => toggleSpec(spec.sys_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-inner">
                        <span className="text-indigo-600 font-medium text-lg">{spec.u_external_id?.substring(0, 2) || 'PS'}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{spec.u_name}</h3>
                        <p className="text-sm text-gray-500">ID: {spec.sys_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        spec.offerings.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {spec.offerings.length} {spec.offerings.length === 1 ? 'offering' : 'offerings'}
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200">
                        {expandedSpec === spec.sys_id ? (
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedSpec === spec.sys_id && (
                  <div className="border-t border-gray-200 px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                        <p className="text-gray-700">{spec.u_description || 'No description available'}</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Version</h4>
                          <p className="text-gray-700">{spec.u_version || 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Validity Period</h4>
                          <p className="text-gray-700">
                            {formatDate(spec.u_valid_from)} to {formatDate(spec.u_valid_to)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">Product Offerings</h3>
                        <div className="relative w-full sm:w-64">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search offerings..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                            value={offeringSearchTerm}
                            onChange={(e) => {
                              setOfferingSearchTerm(e.target.value);
                              setOfferingCurrentPage(1);
                            }}
                          />
                        </div>
                      </div>

                      {filteredOfferings.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {paginatedOfferings.map((offering) => (
                                <tr key={offering.sys_id} className="hover:bg-gray-50 transition-colors duration-150">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {editingOffering === offering.sys_id ? (
                                        <input
                                          type="text"
                                          name="u_name"
                                          value={editFormData.u_name}
                                          onChange={handleEditFormChange}
                                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                        />
                                      ) : (
                                        offering.u_name || 'Unnamed Offering'
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 max-w-xs overflow-hidden overflow-ellipsis" 
                                      dangerouslySetInnerHTML={{ __html: offering.u_description || 'No description' }}>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                      {editingOffering === offering.sys_id ? (
                                        <input
                                          type="text"
                                          name="u_price"
                                          value={editFormData.u_price}
                                          onChange={handleEditFormChange}
                                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                        />
                                      ) : (
                                        offering.u_price ? `$${offering.u_price}` : 'N/A'
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {editingOffering === offering.sys_id ? (
                                      <select
                                        name="u_status"
                                        value={editFormData.u_status}
                                        onChange={handleEditFormChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                      >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Discontinued">Discontinued</option>
                                        <option value="Draft">Draft</option>
                                      </select>
                                    ) : (
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(offering.u_status)}`}>
                                        {offering.u_status || 'Unknown'}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editingOffering === offering.sys_id ? (
                                      <>
                                        <button
                                          onClick={() => handleUpdateOffering(offering.sys_id)}
                                          className="text-green-600 hover:text-green-900 mr-3 transition-colors duration-200"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingOffering(null)}
                                          className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handleEditClick(offering)}
                                          className="text-indigo-600 hover:text-indigo-900 mr-3 transition-colors duration-200"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteOffering(offering.sys_id)}
                                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                        >
                                          Delete
                                        </button>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {offeringsTotalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                              <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                  onClick={() => setOfferingCurrentPage(p => Math.max(1, p - 1))}
                                  disabled={offeringCurrentPage === 1}
                                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                                >
                                  Previous
                                </button>
                                <button
                                  onClick={() => setOfferingCurrentPage(p => Math.min(offeringsTotalPages, p + 1))}
                                  disabled={offeringCurrentPage === offeringsTotalPages}
                                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                                >
                                  Next
                                </button>
                              </div>
                              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(offeringCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(offeringCurrentPage * ITEMS_PER_PAGE, filteredOfferings.length)}</span> of{' '}
                                    <span className="font-medium">{filteredOfferings.length}</span> results
                                  </p>
                                </div>
                                <div>
                                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                      onClick={() => setOfferingCurrentPage(p => Math.max(1, p - 1))}
                                      disabled={offeringCurrentPage === 1}
                                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                                    >
                                      <span className="sr-only">Previous</span>
                                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                    {getVisiblePages(offeringCurrentPage, offeringsTotalPages).map((page, index) => (
                                      page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                          ...
                                        </span>
                                      ) : (
                                        <button
                                          key={page}
                                          onClick={() => setOfferingCurrentPage(page)}
                                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                                            page === offeringCurrentPage
                                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                          }`}
                                        >
                                          {page}
                                        </button>
                                      )
                                    ))}
                                    <button
                                      onClick={() => setOfferingCurrentPage(p => Math.min(offeringsTotalPages, p + 1))}
                                      disabled={offeringCurrentPage === offeringsTotalPages}
                                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                                    >
                                      <span className="sr-only">Next</span>
                                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </nav>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No offerings</h3>
                          <p className="mt-1 text-sm text-gray-500">No offerings found matching your search criteria.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No specifications</h3>
              <p className="mt-1 text-sm text-gray-500">No specifications found matching your search criteria.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of{' '}
                  <span className="font-medium">{filteredData.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {getVisiblePages(currentPage, totalPages).map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                          page === currentPage
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListOffering;