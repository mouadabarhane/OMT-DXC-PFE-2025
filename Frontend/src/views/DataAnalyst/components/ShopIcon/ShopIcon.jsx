import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShopIcon = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/orders');
      setCartCount(response.data.length);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCartCount();

    // Set up event listener for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => navigate('/admin/orders/list')}
        className="text-2xl hover:text-[#0098C2] transition-colors relative"
        title="View Orders"
      >
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ShopIcon;