import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '@assets/nbg-e-omt.png';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [messageContent, setMessageContent] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessageContent({ text: '', type: '' });

    const { username, password } = formData;

    if (!username || !password) {
      setMessageContent({
        text: 'Please enter both username and password',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      // Fetch users from the API
      const response = await fetch('http://localhost:3000/users');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const users = await response.json();

      // Find matching user
      const matchedUser = users.find(
        user => (user.u_email.toLowerCase() === username.toLowerCase() || 
                user.u_name.toLowerCase() === username.toLowerCase()) && 
                user.u_password === password
      );

      if (matchedUser) {
        // Check if user is active
        if (matchedUser.u_status !== 'active') {
          setMessageContent({
            text: 'Your account is inactive. Please contact support.',
            type: 'error',
          });
          return;
        }

        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(matchedUser));

        // Determine redirect path based on role
        let redirectPath = '/';
        switch (matchedUser.u_role.toLowerCase()) {
          case 'admin':
            redirectPath = '/admin';
            break;
          case 'client':
            redirectPath = '/client';
            break;
          case 'product manager':
            redirectPath = '/product-manager';
            break;
          case 'comercial':
            redirectPath = '/comercial';
            break;
          case 'data analyst':
            redirectPath = '/data-analyst';
            break;
          default:
            redirectPath = '/';
        }

        setMessageContent({
          text: `Welcome, ${matchedUser.u_name}! Navigating to your dashboard...`,
          type: 'success',
        });

        setTimeout(() => {
          navigate(redirectPath);
        }, 1500);
      } else {
        setMessageContent({
          text: 'Invalid credentials. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      setMessageContent({
        text: 'An error occurred. Please try again later.',
        type: 'error',
      });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Visual Showcase */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1F2937] via-[#9C4221] to-[#92400E] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCI+PHBhdGggZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgZD0iTTAgNjQwYzAtNzAgMTQwLTE0MCAyODAtMTQwczI4MCA3MCAyODAgMTQwSDkwMGMwLTc3LjYtNjIuNC0xNDAtMTQwLTE0MHMtMTQwIDYyLjQtMTQwIDE0MEg2NDBjMC03Ny42LTYyLjQtMTQwLTE0MC0xNDBTMzYwIDU2Mi40IDM2MCA2NDBIMjQwYzAtNzcuNi02Mi40LTE0MC0xNDAtMTQwUzAgNTYyLjQgMCA2NDB6Ii8+PC9zdmc+')] opacity-10"></div>
        
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
          <img 
            src={Logo} 
            alt="Company Logo" 
            className="h-20 w-auto mb-8"
          />
          
          <h1 className="text-5xl font-bold text-center mb-4">Unified Analytics Platform</h1>
          <p className="text-xl text-center text-amber-100 mb-12 max-w-lg">
            One secure login for all your business intelligence tools
          </p>

          <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
            {[
              { icon: 'ri-dashboard-line', color: 'bg-[#D97706]', text: 'Interactive Dashboards' },
              { icon: 'ri-database-2-line', color: 'bg-[#9C4221]', text: 'Data Exploration' },
              { icon: 'ri-line-chart-line', color: 'bg-[#92400E]', text: 'Advanced Analytics' },
              { icon: 'ri-ai-generate', color: 'bg-[#1F2937]', text: 'AI Insights' },
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center">
                  <div className={`h-12 w-12 rounded-lg ${feature.color} flex items-center justify-center mr-4`}>
                    <i className={`${feature.icon} text-white text-2xl`}></i>
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-12 text-center">
            <div className="inline-flex items-center space-x-4">
              <span className="text-amber-100">Not registered yet?</span>
              <Link 
                to="/register" 
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-medium transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="p-1 bg-gradient-to-r from-[#1F2937] via-[#9C4221] to-[#92400E]"></div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#92400E] mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your dashboard</p>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <i className="ri-google-fill text-red-500 text-xl mr-2"></i>
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <i className="ri-microsoft-fill text-blue-500 text-xl mr-2"></i>
                <span>Microsoft</span>
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-sm text-gray-500">
                  or sign in with credentials
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {messageContent.text && (
                <div className={`rounded-lg p-4 border-l-4 ${
                  messageContent.type === 'success' 
                    ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' 
                    : 'bg-[#FEF2F2] text-[#B91C1C] border-[#EF4444]'
                }`}>
                  {messageContent.text}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-user-3-line text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 focus:ring-2 focus:ring-[#92400E] focus:border-[#92400E] rounded-lg outline-none transition-all bg-white placeholder-gray-400"
                    placeholder="Enter your username or email"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-lock-2-line text-gray-400"></i>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 focus:ring-2 focus:ring-[#92400E] focus:border-[#92400E] rounded-lg outline-none transition-all bg-white placeholder-gray-400"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#92400E] focus:ring-[#92400E] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link to="/forgot-password" className="text-sm font-medium text-[#92400E] hover:text-[#9C4221]">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-4 px-4 rounded-xl text-lg font-medium text-white bg-gradient-to-r from-[#1F2937] via-[#9C4221] to-[#92400E] hover:from-[#111827] hover:via-[#78350F] hover:to-[#7C2D12] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#92400E] shadow-lg transition-all duration-300 ${
                  loading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-xl transform hover:-translate-y-0.5'
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
                    <i className="ri-login-box-line mr-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-[#92400E] hover:text-[#9C4221]">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;