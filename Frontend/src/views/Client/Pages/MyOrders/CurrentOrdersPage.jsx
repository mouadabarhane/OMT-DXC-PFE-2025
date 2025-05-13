import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  RiShoppingBagLine, 
  RiArrowLeftLine, 
  RiCheckboxCircleFill,
  RiTruckLine,
  RiLoader4Line,
  RiCloseCircleFill,
  RiMapPinLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiHomeLine
} from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [deliveryAddresses, setDeliveryAddresses] = useState({});
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [useSameAddress, setUseSameAddress] = useState(false);
  const [sameAddressValue, setSameAddressValue] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  // Color scheme
  const colors = {
    primary: '#B45309',
    primaryLight: '#FB923C',
    primaryDark: '#7C2D12',
    background: '#FFF7ED',
    textDark: '#1E293B',
    textLight: '#64748B'
  };

  useEffect(() => {
    if (!currentUser?.sys_id) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        const ordersResponse = await fetch('http://localhost:3000/orders');
        if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
        const allOrders = await ordersResponse.json();

        const userOrders = allOrders.filter(order => 
          order.u_user?.value === currentUser.sys_id && order.u_choice === 'pending'
        );

        const ordersWithProducts = await Promise.all(
          userOrders.map(async (order) => {
            if (!order.u_product_offerings?.value) return null;

            try {
              const productResponse = await fetch(
                `http://localhost:3000/product-offerings/${order.u_product_offerings.value}`
              );
              if (!productResponse.ok) throw new Error('Product not found');
              const productData = await productResponse.json();

              return {
                ...order,
                product: {
                  name: productData.u_name,
                  image: productData.u_image_url,
                  price: productData.u_price,
                  quantity: 1, // Default quantity
                  category: productData.u_category
                }
              };
            } catch (err) {
              console.error(`Error fetching product ${order.u_product_offerings.value}:`, err);
              return {
                ...order,
                product: null
              };
            }
          })
        );

        const validOrders = ordersWithProducts.filter(order => order !== null)
          .sort((a, b) => new Date(b.u_order_date) - new Date(a.u_order_date));

        // Initialize quantities and delivery addresses
        const initialQuantities = {};
        const initialAddresses = {};
        validOrders.forEach(order => {
          initialQuantities[order.sys_id] = order.product?.quantity || 1;
          initialAddresses[order.sys_id] = order.u_delivery_address || '';
        });

        setQuantities(initialQuantities);
        setDeliveryAddresses(initialAddresses);
        setOrders(validOrders);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser.sys_id, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  const getStatusConfig = (status) => {
    const safeStatus = status?.toLowerCase() || 'pending';
    switch (safeStatus) {
      case 'delivered': 
        return {
          icon: <RiCheckboxCircleFill className="text-xl mr-2" />,
          color: 'bg-green-100 text-green-800',
          text: 'Delivered',
          iconColor: 'text-green-500'
        };
      case 'confirmed':
        return {
          icon: <RiCheckLine className="text-xl mr-2" />,
          color: 'bg-blue-100 text-blue-800',
          text: 'Confirmed',
          iconColor: 'text-blue-500'
        };
      case 'shipped': 
        return {
          icon: <RiTruckLine className="text-xl mr-2" />,
          color: 'bg-purple-100 text-purple-800',
          text: 'Shipped',
          iconColor: 'text-purple-500'
        };
      case 'processing': 
        return {
          icon: <RiLoader4Line className="text-xl mr-2 animate-spin" />,
          color: 'bg-orange-100 text-orange-800',
          text: 'Processing',
          iconColor: 'text-orange-500'
        };
      case 'cancelled': 
        return {
          icon: <RiCloseCircleFill className="text-xl mr-2" />,
          color: 'bg-red-100 text-red-800',
          text: 'Cancelled',
          iconColor: 'text-red-500'
        };
      default: 
        return {
          icon: <RiLoader4Line className="text-xl mr-2" />,
          color: 'bg-gray-100 text-gray-800',
          text: 'Pending',
          iconColor: 'text-gray-500'
        };
    }
  };

  const handleQuantityChange = (orderId, value) => {
    const newValue = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({
      ...prev,
      [orderId]: newValue
    }));
  };

  const handleAddressChange = (orderId, value) => {
    setDeliveryAddresses(prev => ({
      ...prev,
      [orderId]: value
    }));
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  const calculateOrderTotal = (orderId) => {
    const order = orders.find(o => o.sys_id === orderId);
    if (!order || !order.product) return 0;
    return quantities[orderId] * parseFloat(order.product.price);
  };

  const calculateGrandTotal = () => {
    return selectedOrders.reduce((total, orderId) => {
      return total + calculateOrderTotal(orderId);
    }, 0);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setOrders(prev => prev.filter(order => order.sys_id !== orderId));
        // Remove from selected orders if present
        setSelectedOrders(prev => prev.filter(id => id !== orderId));
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order. Please try again.');
    }
  };

  const handleConfirmOrders = async () => {
    try {
      const updatePromises = selectedOrders.map(async orderId => {
        const order = orders.find(o => o.sys_id === orderId);
        const deliveryAddress = useSameAddress ? sameAddressValue : deliveryAddresses[orderId];
        
        const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            u_choice: 'confirmed',
            u_quantity: quantities[orderId],
            u_delivery_address: deliveryAddress,
            u_total_price: calculateOrderTotal(orderId).toFixed(2)
          })
        });
        return response.ok;
      });

      const results = await Promise.all(updatePromises);
      if (results.every(Boolean)) {
        setShowConfirmation(true);
        // Hide confirmation after 3 seconds
        setTimeout(() => {
          setShowConfirmation(false);
          window.location.reload();
        }, 3000);
      } else {
        throw new Error('Some orders failed to update');
      }
    } catch (err) {
      console.error('Error confirming orders:', err);
      alert('Failed to confirm orders. Please try again.');
    }
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.sys_id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: colors.primary }}
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: colors.background }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6 bg-white rounded-xl shadow-sm max-w-md"
        >
          <div className="text-red-500 mb-4 text-lg font-medium">Error loading orders</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-lg transition-all"
            style={{ backgroundColor: colors.primary, color: 'white' }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-2"
            >
              <RiArrowLeftLine className="mr-2" /> Back
            </button>
            <h1 className="text-3xl font-bold" style={{ color: colors.primaryDark }}>My Orders</h1>
            <p className="text-gray-600 mt-1">Review and confirm your pending orders</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center px-4 py-2 bg-white rounded-lg shadow-xs border border-gray-200">
              <RiShoppingBagLine className="mr-2" style={{ color: colors.primary }} />
              <span className="font-medium">{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
            </div>
            <Link 
              to="/"
              className="px-4 py-2 rounded-lg hover:opacity-90 transition-all text-white font-medium"
              style={{ backgroundColor: colors.primary }}
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>

        {/* Same Address Option */}
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100"
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={useSameAddress}
                onChange={() => setUseSameAddress(!useSameAddress)}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <div className="ml-3 flex-1">
                <label className="block font-medium text-gray-700 mb-1">
                  Use same delivery address for all selected orders
                </label>
                {useSameAddress && (
                  <div className="mt-2 flex items-center">
                    <RiHomeLine className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={sameAddressValue}
                      onChange={(e) => setSameAddressValue(e.target.value)}
                      placeholder="Enter delivery address for all orders"
                      className="flex-1 border-b border-gray-300 py-1 px-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders List */}
        <AnimatePresence>
          {orders.length > 0 ? (
            <div className="space-y-6">
              {/* Select All */}
              <div className="flex items-center bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={selectAllOrders}
                  className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-3 font-medium">Select all ({orders.length} orders)</span>
              </div>

              {orders.map((order) => (
                <motion.div
                  key={order.sys_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden border ${selectedOrders.includes(order.sys_id) ? 'border-amber-300' : 'border-gray-100'} hover:shadow-md transition-all`}
                >
                  {/* Order Header */}
                  <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.sys_id)}
                        onChange={() => toggleOrderSelection(order.sys_id)}
                        className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: colors.textDark }}>
                          Order #{order.u_number || order.sys_id.substring(0, 8)}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <RiCalendarLine className="mr-1.5" />
                          {formatDate(order.u_order_date)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {getStatusConfig(order.u_choice).icon}
                      <span className="capitalize font-medium">
                        {getStatusConfig(order.u_choice).text}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Content */}
                  {order.product ? (
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row items-start gap-5">
                        <div className="flex-shrink-0 w-full md:w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={order.product.image || 'https://via.placeholder.com/400'} 
                            alt={order.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 w-full">
                          <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{order.product.name}</h4>
                              {order.product.category && (
                                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mt-1">
                                  {order.product.category}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatPrice(order.product.price)}</div>
                              <div className="flex items-center justify-end mt-2">
                                <button 
                                  onClick={() => handleQuantityChange(order.sys_id, quantities[order.sys_id] - 1)}
                                  className="px-2 py-1 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={quantities[order.sys_id]}
                                  onChange={(e) => handleQuantityChange(order.sys_id, e.target.value)}
                                  className="w-12 text-center border-t border-b border-gray-300 py-1"
                                />
                                <button 
                                  onClick={() => handleQuantityChange(order.sys_id, quantities[order.sys_id] + 1)}
                                  className="px-2 py-1 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            {!useSameAddress && (
                              <div className="flex items-center text-sm mb-3">
                                <RiMapPinLine className="mr-2 text-gray-400" />
                                <span className="font-medium mr-2">Delivery Address:</span>
                                <input
                                  type="text"
                                  value={deliveryAddresses[order.sys_id]}
                                  onChange={(e) => handleAddressChange(order.sys_id, e.target.value)}
                                  placeholder="Enter delivery address"
                                  className="flex-1 border-b border-gray-300 py-1 px-2 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center">
                              <div className="font-medium text-gray-900">
                                Item Total: {formatPrice(calculateOrderTotal(order.sys_id))}
                              </div>
                              
                              <button
                                onClick={() => handleDeleteOrder(order.sys_id)}
                                className="flex items-center text-red-500 hover:text-red-700 transition-colors"
                              >
                                <RiDeleteBinLine className="mr-1" />
                                Remove Order
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-gray-500 italic">Product information not available</div>
                  )}
                </motion.div>
              ))}
              
              {/* Order Summary */}
              {selectedOrders.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md p-6 sticky bottom-6 border border-amber-200"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        {selectedOrders.length} {selectedOrders.length === 1 ? 'Order' : 'Orders'} Selected
                      </h3>
                      <p className="text-gray-600">
                        Grand Total: <span className="font-bold text-amber-700 text-xl">{formatPrice(calculateGrandTotal())}</span>
                      </p>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmOrders}
                      className="px-6 py-3 rounded-lg hover:opacity-90 transition-all text-white font-medium flex items-center gap-2"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <RiCheckLine className="text-xl" />
                      Confirm Orders
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-xl shadow-sm"
            >
              <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-amber-50 mb-6">
                <RiShoppingBagLine className="text-4xl" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No pending orders</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You don't have any pending orders. Start shopping to see your orders here.
              </p>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  to="/"
                  className="inline-block px-6 py-3 rounded-lg hover:opacity-90 transition-all text-white font-medium"
                  style={{ backgroundColor: colors.primary }}
                >
                  Start Shopping
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full text-center"
            >
              <RiCheckboxCircleFill className="mx-auto text-5xl text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Orders Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your {selectedOrders.length} {selectedOrders.length === 1 ? 'order has' : 'orders have'} been successfully confirmed.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-2 rounded-lg hover:opacity-90 transition-all text-white font-medium"
                style={{ backgroundColor: colors.primary }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}