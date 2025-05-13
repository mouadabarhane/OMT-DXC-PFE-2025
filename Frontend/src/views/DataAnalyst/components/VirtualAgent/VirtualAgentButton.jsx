import React, { useState } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';
import VirtualAgent from './VirtualAgent';

export default function VirtualAgentButton() {
  const [isVirtualAgentVisible, setVirtualAgentVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleVirtualAgent = () => {
    setVirtualAgentVisible(!isVirtualAgentVisible);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isVirtualAgentVisible ? (
          <button
            onClick={toggleVirtualAgent}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative w-16 h-16 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center group
              bg-gradient-to-br from-[#00B4D8] to-[#0077B6] hover:from-[#0093b8] hover:to-[#006494]
              ${isHovered ? 'scale-110 shadow-2xl' : 'scale-100'}`}
            title="Virtual Assistant"
            aria-label="Open Virtual Assistant"
          >
            <FaRobot className="text-2xl text-white group-hover:animate-pulse" />
            
            {/* Animated speech bubble on hover */}
            {isHovered && (
              <div className="absolute -top-12 -right-2 bg-white text-[#0077B6] text-xs font-medium px-3 py-2 rounded-lg shadow-md whitespace-nowrap
                animate-fade-in">
                Need help?
                <div className="absolute -bottom-1 right-4 w-3 h-3 bg-white transform rotate-45"></div>
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={toggleVirtualAgent}
            className="w-16 h-16 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center
              bg-gradient-to-br from-[#00B4D8] to-[#0077B6] hover:from-[#0093b8] hover:to-[#006494]
              hover:scale-110 hover:shadow-2xl"
            title="Close Virtual Assistant"
            aria-label="Close Virtual Assistant"
          >
            <FaTimes className="text-2xl text-white" />
          </button>
        )}
      </div>

      {/* Virtual Agent Component */}
      {isVirtualAgentVisible && (
        <VirtualAgent onClose={toggleVirtualAgent} />
      )}
    </>
  );
}