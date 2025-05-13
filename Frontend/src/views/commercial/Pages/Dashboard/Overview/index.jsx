import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiShoppingCartLine, RiHeartLine, RiHeartFill, RiSearchLine, RiStarFill } from 'react-icons/ri';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function ClientProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const navigate = useNavigate();

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await fetch('http://localhost:3000/product-offerings');
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        
        setProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(p => p.u_category))];
        setCategories(['all', ...uniqueCategories]);
        
        // Get featured products (first 6 active products)
        setFeaturedProducts(productsData.filter(p => p.u_status === 'active').slice(0, 6));
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product) => {
    // Add your cart logic here
    alert(`${product.u_name} added to cart!`);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.u_category === selectedCategory;
    const matchesSearch = product.u_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.u_description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#065F46]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4 text-lg font-medium">Error loading products</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#065F46] text-white rounded-lg hover:bg-[#047857] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#065F46] to-[#047857] text-white py-16 px-6">
        <div className="max-w-1xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Discover Amazing Products</h1>
          <p className="text-xl mb-8">Find exactly what you're looking for from our extensive collection</p>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Shop by Category</h2>
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full capitalize ${
                selectedCategory === category
                  ? 'bg-[#065F46] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* All Products */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredProducts.length} products)
            </span>
          </h2>
          <Link 
            to="/client/wishlist" 
            className="flex items-center text-[#065F46] hover:text-[#047857] font-medium"
          >
            <RiHeartFill className="mr-2 text-red-500" /> 
            Wishlist ({wishlist.length})
          </Link>
        </div>
        
        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map(product => (
                <div key={product.sys_id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition border border-gray-100">
                  <div className="relative">
                    <img 
                      src={product.u_image_url || 'https://via.placeholder.com/400'} 
                      alt={product.u_name}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => navigate(`/product/${product.sys_id}`)}
                    />
                    <button 
                      onClick={() => toggleWishlist(product.sys_id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white"
                    >
                      {wishlist.includes(product.sys_id) ? 
                        <RiHeartFill className="text-red-500 text-xl" /> : 
                        <RiHeartLine className="text-gray-600 text-xl" />
                      }
                    </button>
                    {product.u_status === 'inactive' && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-xs font-bold">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h2 
                      className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-[#065F46]"
                      onClick={() => navigate(`/product/${product.sys_id}`)}
                    >
                      {product.u_name}
                    </h2>
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2">
                      {product.u_category}
                    </span>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.u_description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#065F46]">${product.u_price}</span>
                      <button 
                        onClick={() => addToCart(product)}
                        disabled={product.u_status === 'inactive'}
                        className={`flex items-center px-3 py-1 rounded-lg ${
                          product.u_status === 'inactive' 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#065F46] text-white hover:bg-[#047857]'
                        }`}
                      >
                        <RiShoppingCartLine className="mr-1" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-full ${
                          currentPage === pageNum
                            ? 'bg-[#065F46] text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-500 text-lg mb-4">No products found</div>
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#065F46] text-white rounded-lg hover:bg-[#047857]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
      {/* Featured Products Carousel */}
      {featuredProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-8 bg-white rounded-xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Products</h2>
          <Slider {...carouselSettings}>
            {featuredProducts.map(product => (
              <div key={product.sys_id} className="px-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
                  <div className="relative">
                    <img 
                      src={product.u_image_url || 'https://via.placeholder.com/400'} 
                      alt={product.u_name}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => navigate(`/product/${product.sys_id}`)}
                    />
                    <button 
                      onClick={() => toggleWishlist(product.sys_id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white"
                    >
                      {wishlist.includes(product.sys_id) ? 
                        <RiHeartFill className="text-red-500 text-xl" /> : 
                        <RiHeartLine className="text-gray-600 text-xl" />
                      }
                    </button>
                    {product.u_status === 'inactive' && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-xs font-bold">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{product.u_name}</h2>
                    <div className="flex items-center mb-2">
                      <RiStarFill className="text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">4.8 (120)</span>
                    </div>
                    <div className="text-lg font-bold text-[#065F46] mb-3">${product.u_price}</div>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={product.u_status === 'inactive'}
                      className={`w-full py-2 rounded-lg flex items-center justify-center ${
                        product.u_status === 'inactive' 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#065F46] text-white hover:bg-[#047857]'
                      }`}
                    >
                      <RiShoppingCartLine className="mr-2" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}

    </div>
  );
}