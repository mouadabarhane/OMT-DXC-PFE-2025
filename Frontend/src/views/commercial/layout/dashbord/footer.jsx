import React from 'react';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#065F46] border-t border-[#047857] py-2 px-6 shadow-sm z-20 ml-64">
      <div className="flex items-center justify-between">
        {/* Left side - Copyright and links (now in emerald tones) */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-emerald-100 font-medium">
            © {new Date().getFullYear()} LuxeCart
          </span>
          <span className="text-emerald-300 opacity-50">|</span>
          <a href="#" className="text-xs text-emerald-200 hover:text-emerald-300 hover:underline transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-xs text-emerald-200 hover:text-emerald-300 hover:underline transition-colors">
            Terms of Service
          </a>
        </div>
        
        {/* Right side - Social icons (matching header's notification icons) */}
        <div className="flex items-center space-x-4">
          <a href="#" className="text-emerald-100 hover:text-emerald-300 transition-colors p-1">
            <i className="ri-question-line text-sm" />
          </a>
          <a href="#" className="text-emerald-100 hover:text-emerald-300 transition-colors p-1">
            <i className="ri-customer-service-line text-sm" />
          </a>
          <a href="#" className="text-emerald-100 hover:text-emerald-300 transition-colors p-1">
            <i className="ri-settings-3-line text-sm" />
          </a>
          
          {/* Version badge (similar to header's status indicator) */}
          <span className="ml-2 px-2 py-0.5 rounded-full bg-[#047857] text-xs text-emerald-100 border border-emerald-300/30">
            v1.2.0
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;