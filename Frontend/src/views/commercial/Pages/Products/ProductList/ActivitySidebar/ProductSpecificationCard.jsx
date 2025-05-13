const ProductSpecificationCard = ({ spec }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{spec.u_name}</h3>
        <div className="mt-2 text-sm text-gray-600">
          <p><span className="font-medium">Version:</span> {spec.u_version || 'N/A'}</p>
          <p><span className="font-medium">Valid:</span> {new Date(spec.u_valid_from).toLocaleDateString()} - {new Date(spec.u_valid_to).toLocaleDateString()}</p>
          <p><span className="font-medium">External ID:</span> {spec.u_external_id || 'N/A'}</p>
        </div>
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: spec.u_description }}></p>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <p>Last updated: {new Date(spec.sys_updated_on).toLocaleString()} by {spec.sys_updated_by}</p>
        </div>
      </div>
    );
  };