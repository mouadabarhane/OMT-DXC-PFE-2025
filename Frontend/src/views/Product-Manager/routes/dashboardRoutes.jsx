import DashboardLayout from '../layout/dashbord.jsx';

// Dashboard Pages
import Overview from '../Pages/Dashboard/OverviewPage.jsx';
import Performance from '../Pages/Dashboard/PerformancePage.jsx';
import KPIs from '../Pages/Dashboard/KPIsPage.jsx';

import Categories from '../Pages/ProductCatalog/Categories.jsx';
import Inventory from '../Pages/ProductCatalog/InvontoryPage.jsx';
import Pricing from '../Pages/ProductCatalog/Pricing.jsx';

import ManageOfferings from '../Pages/Offerings/MangeOfferingsPage.jsx';
import Bundles from '../Pages/Offerings/BundlesPage.jsx';
import Packages from '../Pages/Offerings/Packages.jsx';
import Promotions from '../Pages/Offerings/PromotionsPage.jsx';

import TechnicalSpecs from '../Pages/Specifications/TechnicalSpec';
import Features from '../Pages/Specifications/FeaturesPage.jsx';
import Requirements from '../Pages/Specifications/Requirements.jsx';
import Compliance from '../Pages/Specifications/Compliance.jsx';

import Strategy from '../Pages/Roadmap/Strategy.jsx';
import Releases from '../Pages/Roadmap/Releases.jsx';
import Backlog from '../Pages/Roadmap/Backlog.jsx';
import Timeline from '../Pages/Roadmap/Timeline.jsx';

import CustomerFeedback from '../Pages/MarketInsights/CustomerFeedback.jsx';
import Competitors from '../Pages/MarketInsights/competitors.jsx';
import MarketTrends from '../Pages/MarketInsights/MarketTrends.jsx';
import ProductAnalytics from '../Pages/MarketInsights/ProductAnalytics.jsx';

const dashboardRoutes = {
  path: '/product-manager',
  element: <DashboardLayout />,
  children: [
    // Dashboard Section
    { index: true, element: <Overview /> },
    { path: 'overview', element: <Overview /> },
    { path: 'performance', element: <Performance /> },
    { path: 'kpis', element: <KPIs /> },
    
    // Product Catalog Section
    { path: 'products/categories', element: <Categories /> },
    { path: 'products/inventory', element: <Inventory /> },
    { path: 'products/pricing', element: <Pricing /> },
    
    // Offerings Section
    { path: 'offerings/manage', element: <ManageOfferings /> },
    { path: 'offerings/bundles', element: <Bundles /> },
    { path: 'offerings/packages', element: <Packages /> },
    { path: 'offerings/promotions', element: <Promotions /> },
    
    // Specifications Section
    { path: 'specifications/TechnicalSpec', element: <TechnicalSpecs /> },
    { path: 'specifications/features', element: <Features /> },
    { path: 'specifications/requirements', element: <Requirements /> },
    { path: 'specifications/compliance', element: <Compliance /> },
    
    // Roadmap Section
    { path: 'roadmap/strategy', element: <Strategy /> },
    { path: 'roadmap/releases', element: <Releases /> },
    { path: 'roadmap/backlog', element: <Backlog /> },
    { path: 'roadmap/timeline', element: <Timeline /> },
    
    // Market Insights Section
    { path: 'insights/feedback', element: <CustomerFeedback /> },
    { path: 'insights/competitors', element: <Competitors /> },
    { path: 'insights/trends', element: <MarketTrends /> },
    { path: 'insights/analytics', element: <ProductAnalytics /> }
  ]
};

export default dashboardRoutes;