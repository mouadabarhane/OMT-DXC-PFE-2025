import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [productOfferings, setProductOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, offeringsResponse] = await Promise.all([
          axios.get('http://localhost:3000/orders'),
          axios.get('http://localhost:3000/product-offerings')
        ]);
        setOrders(ordersResponse.data);
        setProductOfferings(offeringsResponse.data);
        setError('');
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProductName = (productId) => {
    if (!productId) return 'Product Name';
    const product = productOfferings.find(p => p.sys_id === productId);
    return product ? product.u_name : 'Product Name';
  };

  const getProductPrice = (productId) => {
    if (!productId) return 0;
    const product = productOfferings.find(p => p.sys_id === productId);
    return product ? parseFloat(product.u_price) : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await axios.delete(`http://localhost:3000/orders/${orderId}`);
      setOrders(orders.filter(order => order.sys_id !== orderId));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order. Please try again.');
    }
  };

  const startEdit = (order) => {
    setEditingId(order.sys_id);
    setEditQuantity(parseInt(order.u_quantity));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (order) => {
    try {
      const productPrice = getProductPrice(order.u_product_offerings?.value);
      const updatedOrder = {
        ...order,
        u_quantity: editQuantity.toString(),
        u_total_price: (productPrice * editQuantity).toFixed(2)
      };

      await axios.put(`http://localhost:3000/orders/${order.sys_id}`, updatedOrder);
      setOrders(orders.map(o => o.sys_id === order.sys_id ? updatedOrder : o));
      setEditingId(null);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order. Please try again.');
    }
  };

  const calculateTotal = () => {
    return orders.reduce((total, order) => {
      return total + parseFloat(order.u_total_price || 0);
    }, 0).toFixed(2);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#007B98]">My Orders</h1>
          <p className="text-gray-500 mt-1">Review and manage your purchases</p>
        </div>
        <button 
          onClick={() => navigate('/shop')}
          className="px-5 py-2.5 bg-[#007B98] text-white hover:bg-[#006880] rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          Continue Shopping
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Browse our products and add items to get started</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2 bg-[#007B98] text-white rounded-lg hover:bg-[#006880] transition-colors flex items-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.sys_id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">Image</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getProductName(order.u_product_offerings?.value)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.u_number || order.sys_id}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDate(order.u_order_date || order.sys_created_on)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${getProductPrice(order.u_product_offerings?.value).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === order.sys_id ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditQuantity(prev => Math.max(1, prev - 1))}
                              className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <span className="w-8 text-center">{editQuantity}</span>
                            <button 
                              onClick={() => setEditQuantity(prev => prev + 1)}
                              className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900 font-medium">
                            {order.u_quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ${order.u_total_price || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1.5 text-xs rounded-full font-medium ${
                          order.u_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.u_status === 'approved' ? 'bg-green-100 text-green-800' :
                          order.u_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.u_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === order.sys_id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={cancelEdit}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdate(order)}
                              className="text-[#007B98] hover:text-[#006880] font-medium"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-4 justify-end">
                            <button
                              onClick={() => startEdit(order)}
                              className="text-[#007B98] hover:text-[#006880]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(order.sys_id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <div className="max-w-md ml-auto space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[#007B98] pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <button
                  className="w-full mt-6 px-6 py-3 bg-[#007B98] hover:bg-[#006880] text-white rounded-lg font-medium transition-colors shadow-md"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersList;