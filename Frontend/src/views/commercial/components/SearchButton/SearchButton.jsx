import { useState, useCallback } from 'react';
import { RiSearchLine, RiLoader4Line } from 'react-icons/ri';
import { IoCloseCircle } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchButton = ({ placeholder = 'Search services...' }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchServices = useCallback(async (query) => {
    try {
      const response = await axios.get('http://localhost:3000/services', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, []);

  const handleServiceSelect = (service) => {
    navigate(`/service/${service.sys_id}`);
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const fetchSuggestions = async (query) => {
    setIsSearching(true);
    try {
      const services = await searchServices(query);
      setSuggestions(services.slice(0, 5));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center bg-white border border-emerald-200 rounded-full shadow-sm">
        <input
          type="text"
          className="w-full pl-4 pr-10 py-2 rounded-full outline-none text-emerald-900 placeholder-emerald-400"
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => {
            const value = e.target.value;
            setSearchText(value);
            if (value.length > 2) fetchSuggestions(value);
            else setSuggestions([]);
          }}
          onFocus={() => searchText.length > 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {searchText && (
          <IoCloseCircle
            onClick={() => setSearchText('')}
            className="absolute right-10 text-emerald-400 hover:text-emerald-600 cursor-pointer"
          />
        )}
        <button
          onClick={() => searchText && fetchSuggestions(searchText)}
          className="absolute right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full transition-colors"
        >
          {isSearching ? <RiLoader4Line className="animate-spin" /> : <RiSearchLine />}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-emerald-200">
          {suggestions.map((service) => (
            <div
              key={service.sys_id}
              className="p-2 hover:bg-emerald-50 cursor-pointer group"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleServiceSelect(service)}
            >
              <div className="font-medium text-emerald-900 group-hover:text-emerald-600">
                {service.u_name}
              </div>
              <div className="text-sm text-emerald-600 truncate">
                {service.u_description}
              </div>
              <div className="absolute inset-0 border-b border-emerald-100 last:border-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchButton;