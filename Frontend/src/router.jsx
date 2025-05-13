// src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import adminauthRoutes from './views/Admin/routes/authRoutes';
import admindashboardRoutes from './views/Admin/routes/dashboardRoutes';
import productauthRoutes from './views/Product-Manager/routes/authRoutes';
import productdashboardRoutes from './views/Product-Manager/routes/dashboardRoutes';
import clientauthRoutes from './views/Client/routes/authRoutes';
import clientdashboardRoutes from './views/Client/routes/dashboardRoutes';
import dataauthRoutes from './views/DataAnalyst/routes/authRoutes';
import datadashboardRoutes from './views/DataAnalyst/routes/dashboardRoutes';

const router = createBrowserRouter([
  ...adminauthRoutes,
 admindashboardRoutes,
   ...productauthRoutes,
 productdashboardRoutes,
   ...clientauthRoutes,
 clientdashboardRoutes,
   ...dataauthRoutes,
 datadashboardRoutes,
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default router;
