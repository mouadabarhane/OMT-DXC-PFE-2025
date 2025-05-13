// src/routes/dashboardRoutes.jsx
import DashboardLayout from '../layout/dashbord.jsx';

// Dashboard Pages
import Overview from '../Pages/Dashboard/OverviewPage.jsx';
import SavedItems from '../Pages/Wishlist/SavedItemsPage.jsx';
import MyOrders from '../Pages/MyOrders/CurrentOrdersPage.jsx';
import ProductDetails from '../Pages/Extra/ProductDetails.jsx';

const dashboardRoutes = {
  path: '/client',
  element: <DashboardLayout />, 
  children: [
    { index: true, element: <Overview /> },
    { path: 'overview', element: <Overview /> },
    { path: 'wishlist/saved', element: <SavedItems /> },
    { path: 'orders/current', element: <MyOrders /> },
    { path: 'ProductDetails/:id', element: <ProductDetails /> },
  ],
};

export default dashboardRoutes;