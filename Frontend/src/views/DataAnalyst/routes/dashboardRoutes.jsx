// src/routes/dashboardRoutes.jsx
import DashboardLayout from '../layout/dashbord.jsx';

// Dashboard Pages
import Overview from '../Pages/Dashboard/Overview/index.jsx';
// import Analytics from '../views/Pages/Dashboard/Analytics';
// import Insights from '../views/Pages/Dashboard/Insights';

// Portfolio Pages
// import Services from '../views/Pages/Portfolio/Services';
// import Offerings from '../views/Pages/Portfolio/Offerings';
// import Catalog from '../views/Pages/Portfolio/Catalog';

// Products Pages
import ProductList from '../Pages/Products/ProductList/index.jsx';
// import ProductCategories from '../views/Pages/Products/Categories';
import ProductSpecificationsPage from '../Pages/Products/Specifications/index.jsx';
// Customers Pages
// import CustomerAccounts from '../views/Pages/Customers/Accounts';
// import CustomerFeedback from '../views/Pages/Customers/Feedback';
import OrderList from '../Pages/Orders/OrderList.jsx';
// ITIL Management Pages
// import ServiceCatalog from '../views/Pages/ITIL/ServiceCatalog';
// import CMDB from '../views/Pages/ITIL/Configurations';
// import ChangeManagement from '../views/Pages/ITIL/ChangeManagement';
// import Releases from '../views/Pages/ITIL/Releases';
// import SLAs from '../views/Pages/ITIL/SLAs';
import ProductDetailPage from '../Pages/Products/ProductDetailPage.jsx';
const dashboardRoutes = {
  path: '/data-analyst',
  element: <DashboardLayout />, // main layout for all dashboard routes
  children: [
    { index: true, element: <Overview /> },
    // { path: 'overview', element: <Overview /> },
    // { path: 'analytics', element: <Analytics /> },
    // { path: 'insights', element: <Insights /> },

    // Portfolio section
    // { path: 'portfolio/services', element: <Services /> },
    // { path: 'portfolio/offerings', element: <Offerings /> },
    // { path: 'portfolio/catalog', element: <Catalog /> },

    // Products section
    { path: 'products/list', element: <ProductList /> },
    // { path: 'products/categories', element: <ProductCategories /> },
    { path: 'products/specs', element: <ProductSpecificationsPage /> },
    { path: 'product/:sys_id', element: <ProductDetailPage /> },
    // Customers section
    // { path: 'customers/accounts', element: <CustomerAccounts /> },
    // { path: 'customers/feedback', element: <CustomerFeedback /> },
    { path: 'orders/list', element: <OrderList /> },
    // ITIL section
    // { path: 'itil/catalog', element: <ServiceCatalog /> },
    // { path: 'itil/configurations', element: <CMDB /> },
    // { path: 'itil/changes', element: <ChangeManagement /> },
    // { path: 'itil/releases', element: <Releases /> },
    // { path: 'itil/slas', element: <SLAs /> },
  ],
};

export default dashboardRoutes;
