import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginForm() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [messageContent, setMessageContent] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessageContent({ text: '', type: '' });

    const { username, password } = formData;

    const userCredentials = [
      { username: 'admin', password: '1234', path: '/admin', role: 'Administrator', color: '#1F2937', accent: '#3B82F6' },
      { username: 'productmanager', password: '1234', path: '/product-manager', role: 'Product Manager', color: '#065F46', accent: '#10B981' },
      { username: 'client', password: '1234', path: '/client', role: 'Client', color: '#007B98', accent: '#06B6D4' },
      { username: 'comercial', password: '1234', path: '/comercial', role: 'Commercial Team', color: '#5B21B6', accent: '#8B5CF6' },
      { username: 'dataanalyst', password: '1234', path: '/data-analyst', role: 'Data Analyst', color: '#92400E', accent: '#F59E0B' }
    ];

    const matchedUser = userCredentials.find(
      user => user.username === username.toLowerCase() && user.password === password
    );

    if (matchedUser) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMessageContent({
          text: `Welcome, ${matchedUser.role}! Navigating to your dashboard...`,
          type: 'success',
        });
        navigate(matchedUser.path);
      }, 1500);
    } else {
      setMessageContent({
        text: 'Invalid credentials. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] p-4">
      <div className="w-full max-w-md">
        {/* Main card with elegant shadow */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#e2e8f0]">
          {/* Dynamic gradient header based on role */}
          <div className="bg-gradient-to-r from-[#1F2937] via-[#065F46] to-[#007B98] p-8 text-center relative">
            <div className="absolute -bottom-1 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDEyMCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjBjNDAgNDAgMTIwIDgwIDIwMCA4MHMxNjAtNDAgMjAwLTgwIDExMC04MCAyMDAtODAgMTYwIDQwIDIwMCA4MCAxMTAgODAgMjAwIDgwIDE2MC00MCAyMDAtODB2NjBIMHoiLz48L3N2Zz4=')] opacity-20"></div>
            <h1 className="text-3xl font-bold text-white font-sans tracking-tight">Unified Dashboard Portal</h1>
            <p className="text-[#e5e7eb] mt-2">Single access point for all roles</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {messageContent.text && (
              <div className={`rounded-lg p-4 border-l-4 ${
                messageContent.type === 'success' 
                  ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' 
                  : 'bg-[#FEF2F2] text-[#B91C1C] border-[#EF4444]'
              }`}>
                {messageContent.text}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[#1F2937] mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#007B98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-[#E5E7EB] focus:ring-2 focus:ring-[#007B98] focus:border-[#007B98] rounded-lg outline-none transition-all bg-white placeholder-[#9CA3AF]"
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#065F46]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-[#E5E7EB] focus:ring-2 focus:ring-[#065F46] focus:border-[#065F46] rounded-lg outline-none transition-all bg-white placeholder-[#9CA3AF]"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#1F2937] focus:ring-[#1F2937] border-[#D1D5DB] rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#4B5563]">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#007B98] hover:text-[#065F46] transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-lg font-medium text-white bg-gradient-to-r from-[#1F2937] via-[#065F46] to-[#007B98] hover:from-[#111827] hover:via-[#064E3B] hover:to-[#0369A1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007B98] shadow-md transition-all duration-300 ${
                loading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="px-8 pb-8 text-center border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-[#007B98] hover:text-[#065F46] underline decoration-[#1F2937] decoration-2 underline-offset-2 transition-colors">
                Register now
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-[#9CA3AF]">
          © {new Date().getFullYear()} Unified Dashboard • 
          <a href="#" className="text-[#007B98] hover:text-[#065F46] ml-2 transition-colors">Terms</a> • 
          <a href="#" className="text-[#007B98] hover:text-[#065F46] ml-2 transition-colors">Privacy</a>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;