import { useState, useEffect } from 'react';
import ProductListOffering from "./ProductListOfferings/ProductListOfferings";
import ActivitySidebar from "./ActivitySidebar/ActivitySidebar";
import SidebarCategories from './SidebarCategories/SidebarCategories';
import ProductOfferingsTable from './ProductOfferingsTable/ProductOfferingsTable';
import ProductOfferingsCards from './ProductOfferingsCards/ProductOfferingsCards';
import ProductOfferingsTimeline from './ProductOfferingsTimeline/ProductOfferingsTimeline';
import ProductOfferingsStats from './ProductOfferingsStats/ProductOfferingsStats';
import ProductOfferingsCalendar from './ProductOfferingsCalendar/ProductOfferingsCalendar';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('table');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, specsRes] = await Promise.all([
          fetch('http://localhost:3000/product-offerings'),
          fetch('http://localhost:3000/product-specifications')
        ]);

        if (!productsRes.ok) throw new Error('Failed to fetch product offerings');
        if (!specsRes.ok) throw new Error('Failed to fetch specifications');

        const productsData = await productsRes.json();
        const specsData = await specsRes.json();

        setProducts(Array.isArray(productsData) ? productsData : [productsData]);
        setSpecs(Array.isArray(specsData) ? specsData : [specsData]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const productData = {
      u_name: formData.get('name'),
      u_external_id: formData.get('externalId'),
      u_valid_from: `${formData.get('validFrom')} 08:00:00`,
      u_valid_to: formData.get('validTo') ? `${formData.get('validTo')} 08:00:00` : null,
      u_description: formData.get('description'),
      u_product_specification: formData.get('specification'),
      u_status: formData.get('status'),
      u_price: parseFloat(formData.get('price')).toFixed(2),
      u_price_1: formData.get('secondaryPrice') ? parseFloat(formData.get('secondaryPrice')).toFixed(2) : '0.00',
      u_unit_of_measure: formData.get('unitOfMeasure'),
      u_category: formData.get('category'),
      u_market_segment: formData.get('marketSegment'),
      u_channel: Array.from(formData.getAll('channel')).join(', '),
      u_sla: formData.get('sla')
    };

    try {
      const response = await fetch('http://localhost:3000/product-offerings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) throw new Error('Failed to create product offering');

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      setIsCreating(false);
      alert("Product offering created successfully!");
    } catch (err) {
      console.error('Error creating product:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0098C2] mx-auto"></div>
        <p className="mt-3 text-gray-600">Loading product offerings...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md w-full">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <button onClick={() => window.location.reload()} className="text-sm font-medium text-red-700 hover:text-red-600">
                Try again &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 mb-6">
          <div className="lg:col-span-3">
            <SidebarCategories products={products} />
          </div>

          <div className="lg:col-span-9 space-y-6">
            <ProductOfferingsStats data={products} />
            <ProductOfferingsCalendar data={products} />
          </div>

          
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="mt-1 text-sm text-gray-500">
              Manage and create new product offerings for your customers.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0098C2] hover:bg-[#007DA3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0098C2]"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Product
          </button>
        </div>

        {isCreating && (
          <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-[#0098C2]">Create New Product Offering</h3>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                    placeholder="Smartphone X - Pro Edition"
                  />
                </div>

                <div>
                  <label htmlFor="externalId" className="block text-sm font-medium text-gray-700">External ID</label>
                  <input
                    type="text"
                    name="externalId"
                    id="externalId"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                    placeholder="PROD-001"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
                  <select
                    name="status"
                    id="status"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($) *</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      step="0.01"
                      min="0"
                      required
                      className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                      placeholder="1199.99"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="secondaryPrice" className="block text-sm font-medium text-gray-700">Secondary Price ($)</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="secondaryPrice"
                      id="secondaryPrice"
                      step="0.01"
                      min="0"
                      className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">Valid From *</label>
                  <input
                    type="date"
                    name="validFrom"
                    id="validFrom"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label htmlFor="validTo" className="block text-sm font-medium text-gray-700">Valid To</label>
                  <input
                    type="date"
                    name="validTo"
                    id="validTo"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700">Unit of Measure *</label>
                  <input
                    type="text"
                    name="unitOfMeasure"
                    id="unitOfMeasure"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                    placeholder="Piece"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                    placeholder="Smartphones"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="specification" className="block text-sm font-medium text-gray-700">Product Specification *</label>
                  <select
                    name="specification"
                    id="specification"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                  >
                    <option value="">Select a specification</option>
                    {specs.map(spec => (
                      <option key={spec.sys_id} value={spec.sys_id}>
                        {spec.u_name} (v{spec.u_version})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="marketSegment" className="block text-sm font-medium text-gray-700">Market Segment</label>
                  <input
                    type="text"
                    name="marketSegment"
                    id="marketSegment"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                    placeholder="Professional"
                  />
                </div>

                <div>
                  <label htmlFor="sla" className="block text-sm font-medium text-gray-700">SLA</label>
                  <input
                    type="text"
                    name="sla"
                    id="sla"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                    placeholder="Service level agreement"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Channels</label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {['Online', 'Retail Store', 'Wholesale', 'Direct Sales'].map(channel => (
                      <div key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          name="channel"
                          id={`channel-${channel}`}
                          value={channel}
                          className="h-4 w-4 rounded border-gray-300 text-[#0098C2] focus:ring-[#0098C2]"
                        />
                        <label htmlFor={`channel-${channel}`} className="ml-2 block text-sm text-gray-700">
                          {channel}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0098C2] focus:ring-[#0098C2] sm:text-sm p-2 border"
                    placeholder="<p>The Pro Edition of Smartphone X with advanced camera and enhanced performance.</p>"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0098C2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0098C2] text-sm font-medium text-white hover:bg-[#007DA3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0098C2]"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="relative text-2xl font-bold text-[#0098C2] mb-6 pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-[#0098C2] after:rounded-full">
              Product Offerings
            </h2>
            <div className="flex space-x-1 rounded-md shadow-sm">
              <button
                onClick={() => setView('table')}
                className={`relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium ${
                  view === 'table' 
                    ? 'bg-[#E6F7FC] border-[#0098C2] text-[#0098C2]'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Table
              </button>
              <button
                onClick={() => setView('cards')}
                className={`relative inline-flex items-center px-3 py-2 border-t border-b text-sm font-medium ${
                  view === 'cards' 
                    ? 'bg-[#E6F7FC] border-[#0098C2] text-[#0098C2]'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Cards
              </button>
              <button
                onClick={() => setView('timeline')}
                className={`relative inline-flex items-center px-3 py-2 rounded-r-md border text-sm font-medium ${
                  view === 'timeline' 
                    ? 'bg-[#E6F7FC] border-[#0098C2] text-[#0098C2]'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Timeline
              </button>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {view === 'table' && <ProductOfferingsTable data={products} />}
            {view === 'cards' && <ProductOfferingsCards data={products} />}
            {view === 'timeline' && <ProductOfferingsTimeline data={products} />}
          </div>
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-3">
          <ActivitySidebar products={products} specs={specs} />
          </div>

          <div className="lg:col-span-9 space-y-6">
          <ProductListOffering />
          </div>

          
        </div>

      </div>
    </div>
  );
};

export default ProductList;