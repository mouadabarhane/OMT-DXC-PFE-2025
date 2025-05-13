// SearchButton.js
import { useState, useCallback } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { IoCloseCircle } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const nlpHelpers = {
  normalizeText: (text) => text.toLowerCase().replace(/[^\w\s]/gi, '').trim(),
  
  stringSimilarity: (str1, str2) => {
    const set1 = new Set(nlpHelpers.normalizeText(str1).split(' '));
    const set2 = new Set(nlpHelpers.normalizeText(str2).split(' '));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  },

  findSimilarProducts: (products, selectedProduct) => {
    if (!selectedProduct) return [];
    return products
      .filter(p => p.sys_id !== selectedProduct.sys_id)
      .map(p => ({
        ...p,
        similarity: (nlpHelpers.stringSimilarity(selectedProduct.u_name, p.u_name) * 0.7) + 
                   (nlpHelpers.stringSimilarity(selectedProduct.u_description, p.u_description) * 0.3)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }
};

const SearchButton = ({ placeholder = 'Search products...', searchType = 'offerings' }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const endpoints = {
    offerings: 'http://localhost:3000/product-offerings',
    specifications: 'http://localhost:3000/product-specifications'
  };

  const searchProducts = useCallback(async (query) => {
    try {
      const response = await axios.get(endpoints[searchType], {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, [searchType]);

  const handleProductSelect = (product) => {
    navigate(`/admin/product/${product.sys_id}`);
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
  };
  const fetchSuggestions = async (query) => {
    setIsSearching(true);
    try {
      const products = await searchProducts(query);
      const sorted = products
        .map(p => ({ ...p, score: nlpHelpers.stringSimilarity(query, p.u_name) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setSuggestions(sorted);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value.length > 2) fetchSuggestions(value);
    else setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-sm">
        <input
          type="text"
          className="w-full pl-4 pr-10 py-2 rounded-full outline-none"
          placeholder={placeholder}
          value={searchText}
          onChange={handleInputChange}
          onFocus={() => searchText.length > 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {searchText && (
          <IoCloseCircle
            onClick={() => setSearchText('')}
            className="absolute right-10 text-gray-400 hover:text-red-500 cursor-pointer"
          />
        )}
        <button
          onClick={() => searchText && fetchSuggestions(searchText)}
          className="absolute right-2 bg-cyan-600 text-white p-2 rounded-full"
        >
          {isSearching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
          {suggestions.map((product) => (
            <div
              key={product.sys_id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleProductSelect(product)}
            >
              <div className="font-medium">{product.u_name}</div>
              <div className="text-sm text-gray-600 truncate">{product.u_description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchButton;