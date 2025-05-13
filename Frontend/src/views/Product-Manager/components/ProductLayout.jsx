// src/views/Product-Manager/layouts/ProductLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../layout/dashbord/sidebar';
const ProductLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-4 ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default ProductLayout;
