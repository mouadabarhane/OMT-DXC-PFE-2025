import { useState, useCallback } from 'react';
import { RiSearchLine, RiLoader4Line } from 'react-icons/ri';
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

  findSimilarItems: (items, selectedItem) => {
    if (!selectedItem) return [];
    return items
      .filter(p => p.sys_id !== selectedItem.sys_id)
      .map(p => ({
        ...p,
        similarity: (nlpHelpers.stringSimilarity(selectedItem.u_name, p.u_name) * 0.7) + 
                   (nlpHelpers.stringSimilarity(selectedItem.u_description, p.u_description) * 0.3)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }
};

const SearchButton = ({ 
  placeholder = 'Search datasets...', 
  searchType = 'datasets'
}) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const endpoints = {
    datasets: 'http://localhost:3000/data-sets',
    reports: 'http://localhost:3000/analytics-reports',
    queries: 'http://localhost:3000/saved-queries'
  };

  const searchItems = useCallback(async (query) => {
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

  const handleItemSelect = (item) => {
    navigate(`/data-analyst/${searchType}/${item.sys_id}`);
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const fetchSuggestions = async (query) => {
    setIsSearching(true);
    try {
      const items = await searchItems(query);
      const sorted = items
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
      <div className="relative flex items-center bg-white border border-[#D1D5DB] rounded-full shadow-sm">
        <input
          type="text"
          className="w-full pl-4 pr-10 py-2 rounded-full outline-none text-gray-800 placeholder-gray-500"
          placeholder={placeholder}
          value={searchText}
          onChange={handleInputChange}
          onFocus={() => searchText.length > 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {searchText && (
          <IoCloseCircle
            onClick={() => setSearchText('')}
            className="absolute right-10 text-gray-400 hover:text-gray-600 cursor-pointer"
          />
        )}
        <button
          onClick={() => searchText && fetchSuggestions(searchText)}
          className="absolute right-2 p-2 rounded-full bg-[#4A3B76] hover:bg-[#4A3B99] text-white transition-colors"
        >
          {isSearching ? (
            <RiLoader4Line className="animate-spin" />
          ) : (
            <RiSearchLine />
          )}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
          {suggestions.map((item) => (
            <div
              key={item.sys_id}
              className="p-2 hover:bg-[#F5F3FF] cursor-pointer group"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleItemSelect(item)}
            >
              <div className="font-medium text-gray-900 group-hover:text-[#4F46E5]">
                {item.u_name}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {item.u_description}
              </div>
              <div className="absolute inset-0 border-b border-gray-100 last:border-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchButton;