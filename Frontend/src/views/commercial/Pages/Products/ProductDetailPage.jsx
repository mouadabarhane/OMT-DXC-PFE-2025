import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetailPage = () => {
  const { sys_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/product-offerings/${sys_id}`);
        setProduct(response.data);
        fetchSimilarProducts(response.data.u_category);
        setError('');
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sys_id]);

  const fetchSimilarProducts = async (category) => {
    try {
      const response = await axios.get('http://localhost:3000/product-offerings', {
        params: {
          category: category,
          limit: 4,
          exclude: sys_id
        }
      });
      setSimilarProducts(response.data);
    } catch (err) {
      console.error('Error fetching similar products:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    setCartMessage('');
  
    try {
      const orderData = {
        u_product_offerings: {
          link: `http://localhost:3000/product-offerings/${product.sys_id}`,
          value: product.sys_id,
          display_value: product.u_name, // Add product name here
          u_price: product.u_price, // Add price for reference
          u_name: product.u_name // Add name again for easy access
        },
        u_quantity: quantity.toString(),
        u_total_price: (parseFloat(product.u_price) * quantity).toFixed(2),
        u_status: "pending",
        u_order_date: new Date().toISOString(),
        u_delivery_address: "To be specified"
      };
  
      const response = await axios.post('http://localhost:3000/orders', orderData);
      
      if (response.data && response.data.u_number) {
        setCartMessage(`${product.u_name} (x${quantity}) added to cart successfully! Order #${response.data.u_number}`);
      } else {
        setCartMessage(`${product.u_name} (x${quantity}) added to cart successfully!`);
      }
  
      window.dispatchEvent(new Event('cartUpdated'));
      
      setTimeout(() => setCartMessage(''), 3000);
    } catch (err) {
      console.error('Order creation error:', err.response?.data || err.message);
      setCartMessage('Failed to create order. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#007B98]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8 bg-red-50 rounded-lg shadow-sm">
        <div className="text-red-600 font-medium text-lg">{error}</div>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-sm">
        <div className="text-gray-700 text-lg">Product not found</div>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 px-5 py-2.5 bg-white border border-[#007B98] text-[#007B98] hover:bg-[#007B98]/10 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Products
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {/* Product Header */}
        <div className="bg-[#007B98] text-white px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{product.u_name}</h1>
              <div className="flex items-center mt-3 space-x-3">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                  {product.u_category || 'Uncategorized'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.u_status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.u_status || 'N/A'}
                </span>
              </div>
            </div>
            <div className="text-right bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-4xl font-bold text-white">
                ${parseFloat(product.u_price || 0).toFixed(2)}
              </div>
              <div className="text-sm text-white/80 mt-1">
                {product.u_unit_of_measure || 'Unit'}
              </div>
            </div>
          </div>
        </div>

        {/* Product Content */}
        <div className="p-8">
          {cartMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              cartMessage.includes('successfully') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {cartMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Product Info */}
            <div className="lg:col-span-2 space-y-8">
              <div 
                className="prose max-w-none text-gray-700" 
                dangerouslySetInnerHTML={{ 
                  __html: product.u_description || '<p>No description available</p>' 
                }} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-lg text-[#007B98] mb-3">Product Specifications</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium">Version:</span> 
                      <span className="text-gray-800">{product.u_version || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium">Market Segment:</span> 
                      <span className="text-gray-800">{product.u_market_segment || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 font-medium">Channels:</span> 
                      <span className="text-gray-800">{product.u_channel || 'N/A'}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-lg text-[#007B98] mb-3">Availability</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium">Valid From:</span> 
                      <span className="text-gray-800">{formatDate(product.u_valid_from)}</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600 font-medium">Valid To:</span> 
                      <span className="text-gray-800">{formatDate(product.u_valid_to)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 font-medium">Last Updated:</span> 
                      <span className="text-gray-800">{formatDate(product.sys_updated_on)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Product Sidebar */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                <h3 className="font-semibold text-lg text-[#007B98] mb-4">Order Options</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-fit">
                      <button 
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 bg-white min-w-[40px] text-center">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="text-gray-800">${parseFloat(product.u_price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span className="text-[#007B98]">Total:</span>
                      <span className="text-[#007B98]">
                        ${(parseFloat(product.u_price || 0) * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md ${
                        isAddingToCart
                          ? 'bg-[#007B98]/70 cursor-not-allowed'
                          : 'bg-[#007B98] hover:bg-[#006880]'
                      }`}
                    >
                      {isAddingToCart ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                <h3 className="font-semibold text-lg text-[#007B98] mb-4">Technical Details</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium">Product ID:</span>
                    <span className="text-gray-800 font-mono">{product.sys_id}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium">Created By:</span>
                    <span className="text-gray-800">{product.sys_created_by || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium">Updated By:</span>
                    <span className="text-gray-800">{product.sys_updated_by || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600 font-medium">Modification Count:</span>
                    <span className="text-gray-800">{product.sys_mod_count || '0'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-[#007B98] mb-6">Similar Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((item) => (
                  <div 
                    key={item.sys_id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg cursor-pointer transition-all duration-200 bg-white group"
                    onClick={() => navigate(`/dashboard/product/${item.sys_id}`)}
                  >
                    <div className="bg-gray-100 rounded-lg h-40 mb-4 flex items-center justify-center overflow-hidden">
                      <div className="bg-[#007B98]/10 w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <span className="text-gray-400">Product Image</span>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-800 group-hover:text-[#007B98] transition-colors">
                      {item.u_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.u_description?.replace(/<[^>]*>/g, '') || 'No description available'}
                    </p>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-[#007B98] font-semibold">
                        ${parseFloat(item.u_price || 0).toFixed(2)}
                      </p>
                      <span className="text-xs bg-[#007B98]/10 text-[#007B98] px-2 py-1 rounded-full">
                        {item.u_category || 'Uncategorized'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;