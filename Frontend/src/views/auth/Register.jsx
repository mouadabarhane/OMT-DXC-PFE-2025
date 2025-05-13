import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        u_name: '',
        u_email: '',
        u_phone_number: '',
        u_password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.u_name.trim()) newErrors.u_name = 'Full name is required';
        if (!formData.u_email.trim()) {
            newErrors.u_email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.u_email)) {
            newErrors.u_email = 'Please enter a valid email';
        }
        if (!formData.u_phone_number.trim()) newErrors.u_phone_number = 'Phone number is required';
        if (!formData.u_password) {
            newErrors.u_password = 'Password is required';
        } else if (formData.u_password.length < 4) {
            newErrors.u_password = 'Password must be at least 4 characters';
        }
        if (formData.u_password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateId = () => {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setIsSubmitting(true);

        try {
            const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const newUser = {
                ...formData,
                u_role: "client",
                u_status: "active",
                sys_id: generateId(),
                sys_created_on: currentDate,
                sys_updated_on: currentDate,
                sys_mod_count: "0",
                sys_tags: "",
                sys_updated_by: "system",
                sys_created_by: "system",
                u_last_login: currentDate
            };

            delete newUser.confirmPassword;

            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                throw new Error('Registration failed. Please try again.');
            }

            setMessage({
                text: 'Registration successful! Redirecting to login...',
                type: 'success'
            });
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setErrors({ form: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
            {/* Left side - Visual Showcase */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1F2937] via-[#9C4221] to-[#92400E] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCI+PHBhdGggZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgZD0iTTAgNjQwYzAtNzAgMTQwLTE0MCAyODAtMTQwczI4MCA3MCAyODAgMTQwSDkwMGMwLTc3LjYtNjIuNC0xNDAtMTQwLTE0MHMtMTQwIDYyLjQtMTQwIDE0MEg2NDBjMC03Ny42LTYyLjQtMTQwLTE0MC0xNDBTMzYwIDU2Mi40IDM2MCA2NDBIMjQwYzAtNzcuNi02Mi40LTE0MC0xNDAtMTQwUzAgNTYyLjQgMCA2NDB6Ii8+PC9zdmc+')] opacity-10"></div>
                
                <div className="relative h-full flex flex-col items-center justify-center p-30 text-white">

                    <h1 className="text-5xl font-bold text-center mb-12">Join Our Platform</h1>
                    <p className="text-xl text-center text-amber-100 mb-12 max-w-lg">
                        Create your account to access all features
                    </p>

                    <div className="mt-auto pt-12 text-center">
                        <div className="inline-flex items-center space-x-4">
                            <span className="text-amber-100">Already registered?</span>
                            <button 
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-medium transition-colors"
                            >
                                Sign in instead
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Registration Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="p-1 bg-gradient-to-r from-[#1F2937] via-[#9C4221] to-[#92400E]"></div>
                    
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#92400E] mb-2">Create Account</h2>
                            <p className="text-gray-600">Fill in your details to get started</p>
                        </div>

                        {message.text && (
                            <div className={`rounded-lg p-4 mb-6 border-l-4 ${
                                message.type === 'success' 
                                    ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' 
                                    : 'bg-[#FEF2F2] text-[#B91C1C] border-[#EF4444]'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {errors.form && (
                                <div className="rounded-lg p-4 bg-red-50 text-red-700 border-l-4 border-red-500">
                                    {errors.form}
                                </div>
                            )}

                            <div>
                                <label htmlFor="u_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="u_name"
                                    name="u_name"
                                    value={formData.u_name}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border ${errors.u_name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#D97706] focus:border-[#D97706]`}
                                    placeholder="John Doe"
                                />
                                {errors.u_name && <p className="mt-1 text-sm text-red-600">{errors.u_name}</p>}
                            </div>

                            <div>
                                <label htmlFor="u_email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="u_email"
                                    name="u_email"
                                    value={formData.u_email}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border ${errors.u_email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#D97706] focus:border-[#D97706]`}
                                    placeholder="you@example.com"
                                />
                                {errors.u_email && <p className="mt-1 text-sm text-red-600">{errors.u_email}</p>}
                            </div>

                            <div>
                                <label htmlFor="u_phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="u_phone_number"
                                    name="u_phone_number"
                                    value={formData.u_phone_number}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border ${errors.u_phone_number ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#D97706] focus:border-[#D97706]`}
                                    placeholder="0600112233"
                                />
                                {errors.u_phone_number && <p className="mt-1 text-sm text-red-600">{errors.u_phone_number}</p>}
                            </div>

                            <div>
                                <label htmlFor="u_password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="u_password"
                                    name="u_password"
                                    value={formData.u_password}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border ${errors.u_password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#D97706] focus:border-[#D97706]`}
                                    placeholder="At least 4 characters"
                                />
                                {errors.u_password && <p className="mt-1 text-sm text-red-600">{errors.u_password}</p>}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#D97706] focus:border-[#D97706]`}
                                    placeholder="Re-enter your password"
                                />
                                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-[#1F2937] via-[#9C4221] to-[#92400E] hover:from-[#111827] hover:via-[#78350F] hover:to-[#7C2D12] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D97706] ${
                                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating account...
                                        </>
                                    ) : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;