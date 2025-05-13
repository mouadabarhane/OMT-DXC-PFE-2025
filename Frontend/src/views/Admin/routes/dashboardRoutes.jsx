// src/routes/dashboardRoutes.jsx
import DashboardLayout from '../layout/dashbord.jsx';
import AllUsers from '../Pages/UserManagement/AllUsers.jsx';
import RandP from '../Pages/UserManagement/RolesANDPermissions.jsx';
import UserActivity from '../Pages/UserManagement/UserActivity.jsx';

// Dashboard Pages
import Overview from '../Pages/Dashboard/index.jsx';
const dashboardRoutes = {
  path: '/admin',
  element: <DashboardLayout />, // main layout for all dashboard routes
  children: [
    { index: true, element: <Overview /> },
    { path: 'overview', element: <Overview /> },
    { path: '/admin/users/AllUsers', element: <AllUsers /> },
    { path: '/admin/users/Roles&Permissions', element: <RandP /> },
    { path: '/admin/users/UserActivity', element: <UserActivity /> },

  ],
};

export default dashboardRoutes;
