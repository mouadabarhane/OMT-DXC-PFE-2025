import React from 'react';

const ProductOfferingsCards = ({ data }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-transparent p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item) => (
        <div key={item.sys_id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow text-sm">
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-900 font-medium">{item.u_name}</h3>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                v{item.u_version}
              </span>
            </div>

            <p className="text-gray-500 text-xs mb-2 line-clamp-2">{item.u_description}</p>

            <div className="text-gray-500 text-xs mb-1">
              <span className="mr-1.5 text-gray-400">📅</span>
              {formatDate(item.u_valid_from)} - {formatDate(item.u_valid_to)}
            </div>

            {item.u_external_id && (
              <div className="text-gray-500 text-xs">
                <span className="mr-1.5 text-gray-400">🏷️</span>
                {item.u_external_id}
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-800 text-xs font-light">
              ℹ️ View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductOfferingsCards;
