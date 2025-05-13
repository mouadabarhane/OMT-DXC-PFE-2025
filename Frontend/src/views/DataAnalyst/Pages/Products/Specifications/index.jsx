import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductSpecification from './ProductSpecification/ProductSpecification';
import CreateProductSpecification from './CreateProductSpecification/CreateProductSpecification';
import OverviewCards from './DataVisualisationProductSpecification/OverviewCards';
import VersionPieChart from './DataVisualisationProductSpecification/VersionPieChart';
import CreationActivityChart from './DataVisualisationProductSpecification/CreationActivityChart';
import ValidityTimeline from './DataVisualisationProductSpecification/ValidityTimeline';

const ProductSpecificationsPage = () => {
  const [specData, setSpecData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/product-specifications');
      setSpecData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewSpecification = async (newSpec) => {
    try {
      // Add the new specification to the state immediately for a responsive UI
      setSpecData(prev => [...prev, newSpec]);
      
      // Optionally, refetch all data to ensure consistency
      await fetchData();
    } catch (err) {
      console.error('Error updating data:', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading data...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="relative text-2xl font-bold text-[#0098C2] mb-6 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-[#0098C2] after:rounded-full">
        Product Specifications Analytics
      </h2>

      <OverviewCards data={specData} />

      <div className="mb-6">
        <h2 className="relative text-2xl font-bold text-[#0098C2] mb-4 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#0098C2] after:rounded-full">
          Product Specifications
        </h2>
        <ProductSpecification data={specData} />
      </div>

      {/* Create + Validity Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-4">
          <h2 className="relative text-2xl font-bold text-[#0098C2] mb-4 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#0098C2] after:rounded-full">
            Create Product Specifications
          </h2>
          <div className="h-full">
            <CreateProductSpecification onSuccess={handleNewSpecification} />
          </div>
        </div>

        <div className="md:col-span-8">
          <h2 className="relative text-2xl font-bold text-[#0098C2] mb-4 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-[#0098C2] after:rounded-full">
            Product Validity Timeline
          </h2>
          <div className="h-full">
            <ValidityTimeline data={specData} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="relative text-2xl font-bold text-[#0098C2] mb-4 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-[#0098C2] after:rounded-full">
            Product Distribution by Version
          </h2>
          <VersionPieChart data={specData} />
        </div>
        <div>
          <h2 className="relative text-2xl font-bold text-[#0098C2] mb-4 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-[#0098C2] after:rounded-full">
            Product Creation Activity
          </h2>
          <CreationActivityChart data={specData} />
        </div>
      </div>

    </div>
  );
};

export default ProductSpecificationsPage;