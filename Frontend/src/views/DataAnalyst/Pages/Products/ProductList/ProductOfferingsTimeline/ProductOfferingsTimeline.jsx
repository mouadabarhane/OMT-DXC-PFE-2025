import React from 'react';
import { FiClock, FiCalendar } from 'react-icons/fi';

const ProductOfferingsTimeline = ({ data }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Sort by valid_from date
  const sortedData = [...data].sort((a, b) => 
    new Date(a.u_valid_from) - new Date(b.u_valid_from)
  );

  return (
    <div className="bg-transparent p-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {sortedData.map((item, index) => (
          <div key={item.sys_id} className="relative pl-8 pb-6">
            {/* Timeline dot */}
            <div className={`absolute left-0 w-3 h-3 rounded-full ${index % 2 === 0 ? 'bg-[#0098C2]' : 'bg-green-500'}`}></div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-gray-900">{item.u_name}</h3>
                <span className="text-xs font-medium bg-[#D5F3FA] text-[#0098C2] px-2 py-0.5 rounded-full">
                  v{item.u_version}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-2 line-clamp-1">{item.u_description}</p>

              <div className="flex items-center text-xs text-gray-500">
                <FiCalendar className="mr-1" />
                {formatDate(item.u_valid_from)} - {formatDate(item.u_valid_to)}
                {item.u_external_id && (
                  <span className="ml-3 flex items-center">
                    <FiClock className="mr-1" />
                    {item.u_external_id}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductOfferingsTimeline;
