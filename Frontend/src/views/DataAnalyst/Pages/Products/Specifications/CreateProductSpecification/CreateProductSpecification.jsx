import React, { useState } from 'react';
import axios from 'axios';
import { FiSave, FiCalendar, FiInfo, FiFileText } from 'react-icons/fi';

const CreateProductSpecification = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    u_name: '',
    u_version: '',
    u_description: '',
    u_external_id: '',
    u_valid_from: '',
    u_valid_to: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post('http://localhost:3000/product-specifications', formData);
      
      if (response.status === 201) {
        setSuccessMessage('Product specification created successfully!');
        // Call the onSuccess callback with the new specification
        onSuccess(response.data);
        // Reset the form
        setFormData({
          u_name: '',
          u_version: '',
          u_description: '',
          u_external_id: '',
          u_valid_from: '',
          u_valid_to: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product specification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-gray-500 mt-1">Fill in the details below to create a new product specification</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border-l-3 border-red-500 rounded-r flex items-start">
          <svg className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="ml-2 text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-3 bg-green-50 border-l-3 border-green-500 rounded-r flex items-start">
          <svg className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="ml-2 text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <FiInfo className="text-[#0098C2]" />
              <h3 className="text-sm font-medium uppercase tracking-wider">Information</h3>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="u_name" className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="u_name"
                name="u_name"
                value={formData.u_name}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="u_version" className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
                Version <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="u_version"
                name="u_version"
                value={formData.u_version}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <FiCalendar className="text-[#0098C2]" />
              <h3 className="text-sm font-medium uppercase tracking-wider">Validity Period</h3>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="u_valid_from" className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
                Valid From <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="u_valid_from"
                name="u_valid_from"
                value={formData.u_valid_from}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="u_valid_to" className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
                Valid To <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="u_valid_to"
                name="u_valid_to"
                value={formData.u_valid_to}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>
        <div className="w-full space-y-1">
          <label
            htmlFor="u_external_id"
            className="block text-xs font-medium text-gray-600 uppercase tracking-wider"
          >
            External ID
          </label>
          <input
            type="text"
            id="u_external_id"
            name="u_external_id"
            value={formData.u_external_id}
            onChange={handleChange}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center space-x-2 text-gray-700 mb-2">
            <FiFileText className="text-[#0098C2]" />
            <label htmlFor="u_description" className="block text-xs font-medium text-gray-600 uppercase tracking-wider">
              Description <span className="text-red-500">*</span>
            </label>
          </div>
          <textarea
            id="u_description"
            name="u_description"
            rows={3}
            value={formData.u_description}
            onChange={handleChange}
            required
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-[#0098C2] hover:bg-[#8DC9DD] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <FiSave className="-ml-0.5 mr-1.5 h-4 w-4" /> Create Specification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductSpecification;