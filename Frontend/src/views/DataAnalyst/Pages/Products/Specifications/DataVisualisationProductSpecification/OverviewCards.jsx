import React from 'react';
import { 
  FiBox, 
  FiLayers, 
  FiCheckCircle, 
  FiClock 
} from 'react-icons/fi';

const OverviewCards = ({ data }) => {
  // Calculate metrics
  const totalProducts = data.length;
  const uniqueVersions = new Set(data.map(item => item.u_version)).size;
  const activeProducts = data.filter(item => new Date(item.u_valid_to) > new Date()).length;
  const avgDuration = data.reduce((sum, item) => {
    return sum + ((new Date(item.u_valid_to) - new Date(item.u_valid_from)) / (1000 * 60 * 60 * 24)); // Convert to days
  }, 0) / data.length;

  // Card data configuration
  const cards = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <FiBox className="text-[#0098C2] text-2xl" />,
      change: null
    },
    {
      title: "Unique Versions",
      value: uniqueVersions,
      icon: <FiLayers className="text-[#8DC9DD] text-2xl" />,
      change: null
    },
    {
      title: "Active Products",
      value: activeProducts,
      icon: <FiCheckCircle className="text-green-500 text-2xl" />,
      change: `${Math.round((activeProducts / totalProducts) * 100)}%`
    },
    {
      title: "Avg Duration",
      value: avgDuration.toFixed(1),
      icon: <FiClock className="text-amber-500 text-2xl" />,
      change: "days",
      unit: "days"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {card.title}
              </p>
              <div className="flex items-end mt-2">
                <p className="text-3xl font-bold text-gray-800">
                  {card.value}
                </p>
                {card.unit && (
                  <span className="ml-1 text-sm text-gray-500 font-medium">
                    {card.unit}
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              {card.icon}
            </div>
          </div>
          
          {card.change && (
            <div className="mt-4 flex items-center">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                typeof card.change === 'string' && card.change.includes('%')
                  ? 'bg-green-50 text-green-600'
                  : 'bg-blue-50 text-blue-600'
              }`}>
                {card.change}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {typeof card.change === 'string' && card.change.includes('%') 
                  ? 'of total' 
                  : ''}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;