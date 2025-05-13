const ProductOfferingsCard = ({ product }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{product.u_name}</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {product.u_status}
          </span>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-4">
          <div className="text-sm">
            <p className="font-medium text-gray-700">Price:</p>
            <p className="text-gray-900">${product.u_price}</p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-700">Category:</p>
            <p className="text-gray-900">{product.u_category}</p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-700">Market Segment:</p>
            <p className="text-gray-900">{product.u_market_segment}</p>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: product.u_description }}></p>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          <p><span className="font-medium">Available:</span> {new Date(product.u_valid_from).toLocaleDateString()} - {new Date(product.u_valid_to).toLocaleDateString()}</p>
          <p><span className="font-medium">Channels:</span> {product.u_channel}</p>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <p>Last updated: {new Date(product.sys_updated_on).toLocaleString()} by {product.sys_updated_by}</p>
        </div>
      </div>
    );
  };