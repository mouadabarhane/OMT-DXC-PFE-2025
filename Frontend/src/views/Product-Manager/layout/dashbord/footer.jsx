const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-4 shadow-xs z-20 ml-64">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500 font-medium">
            © {new Date().getFullYear()} DXC Technology
          </span>
          <span className="text-gray-300">|</span>
          <a href="#" className="text-xs text-[#00758D] hover:underline">
            Privacy
          </a>
          <a href="#" className="text-xs text-[#00758D] hover:underline">
            Terms
          </a>
        </div>
        
        <div className="flex items-center space-x-3">
          <a href="#" className="text-gray-400 hover:text-[#00758D] transition-colors">
            <i className="ri-question-line text-sm" />
          </a>
          <a href="#" className="text-gray-400 hover:text-[#00758D] transition-colors">
            <i className="ri-github-fill text-sm" />
          </a>
          <a href="#" className="text-gray-400 hover:text-[#00758D] transition-colors">
            <i className="ri-twitter-x-fill text-sm" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;