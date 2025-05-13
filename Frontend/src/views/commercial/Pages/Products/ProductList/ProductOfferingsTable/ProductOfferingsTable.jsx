import React, { useState } from 'react';
import { FiExternalLink, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ProductOfferingsTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-transparent shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-transparent">
          <thead className="bg-transparent">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Period</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">External ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-transparent">
            {currentItems.map((item) => (
              <tr key={item.sys_id} className="hover:bg-gray-50 bg-transparent">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{item.u_name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 text-xs font-medium bg-[#D5F3FA] text-[#0098C2] rounded-full">
                    {item.u_version}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                  <div className="line-clamp-2">{item.u_description}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.u_valid_from)} to {formatDate(item.u_valid_to)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {item.u_external_id || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-[#0098C2] hover:text-[#007399] mr-3">
                    View
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <FiExternalLink className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 bg-transparent flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md bg-transparent text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md bg-transparent text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 text-sm font-medium ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                <FiChevronLeft className="h-4 w-4" />
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
                    onClick={() => goToPage(pageNum)}
                    className={`relative inline-flex items-center px-3 py-1 border text-sm font-medium ${
                      currentPage === pageNum
                        ? 'z-10 bg-[#E5F9FD] border-[#0098C2] text-[#0098C2]'
                        : 'bg-transparent border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 text-sm font-medium ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOfferingsTable;
