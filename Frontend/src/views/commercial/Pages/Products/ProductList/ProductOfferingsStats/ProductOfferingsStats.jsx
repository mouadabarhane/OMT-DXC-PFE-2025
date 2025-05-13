import React from 'react';
import { FiPieChart, FiTrendingUp, FiClock, FiBox } from 'react-icons/fi';

const ProductOfferingsStats = ({ data }) => {
  // Calculate statistics
  const activeProducts = data.filter(item => 
    new Date(item.u_valid_to) > new Date()
  ).length;

  const versions = [...new Set(data.map(item => item.u_version))];
  const avgVersion = versions.length > 0 
    ? (versions.reduce((sum, v) => sum + parseFloat(v), 0) / versions.length ): 0;

  const now = new Date();
  const avgDuration = data.length > 0
    ? data.reduce((sum, item) => {
        const from = new Date(item.u_valid_from);
        const to = new Date(item.u_valid_to);
        return sum + (to - from) / (1000 * 60 * 60 * 24);
      }, 0) / data.length
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Offerings Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <FiBox className="text-blue-500 text-xl mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{data.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center">
            <FiTrendingUp className="text-green-500 text-xl mr-3" />
            <div>
              <p className="text-sm text-gray-500">Active Products</p>
              <p className="text-2xl font-semibold text-gray-900">{activeProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center">
            <FiPieChart className="text-purple-500 text-xl mr-3" />
            <div>
              <p className="text-sm text-gray-500">Avg. Version</p>
              <p className="text-2xl font-semibold text-gray-900">{avgVersion.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center">
            <FiClock className="text-yellow-500 text-xl mr-3" />
            <div>
              <p className="text-sm text-gray-500">Avg. Duration</p>
              <p className="text-2xl font-semibold text-gray-900">{avgDuration.toFixed(0)} days</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-md font-medium text-gray-800 mb-3">Version Distribution</h3>
        <div className="flex flex-wrap gap-2">
          {versions.map(version => (
            <span key={version} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
              v{version}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductOfferingsStats;