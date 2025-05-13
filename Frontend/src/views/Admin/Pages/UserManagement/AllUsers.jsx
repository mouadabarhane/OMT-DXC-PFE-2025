import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const UsersManagement = () => {
  const colors = {
    primary: '#007B98',
    secondary: '#5BC0DE',
    success: '#5CB85C',
    warning: '#F0AD4E',
    danger: '#D9534F',
    info: '#5BC0DE',
    dark: '#343A40'
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  const usersPerPage = 8;

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    u_name: '',
    u_email: '',
    u_role: 'client',
    u_phone_number: '',
    u_status: 'active',
    u_password: ''
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.u_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.u_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.u_status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.u_role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Role colors
  const getRoleColor = (role) => {
    const roleColors = {
      'admin': 'bg-purple-100 text-purple-800',
      'client': 'bg-blue-100 text-blue-800',
      'comercial': 'bg-green-100 text-green-800',
      'product manager': 'bg-yellow-100 text-yellow-800',
      'data analyst': 'bg-indigo-100 text-indigo-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  // Status colors
  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open modal for new user
  const openNewUserModal = () => {
    setCurrentUser(null);
    setFormData({
      u_name: '',
      u_email: '',
      u_role: 'client',
      u_phone_number: '',
      u_status: 'active',
      u_password: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing user
  const openEditUserModal = (user) => {
    setCurrentUser(user);
    setFormData({
      u_name: user.u_name,
      u_email: user.u_email,
      u_role: user.u_role,
      u_phone_number: user.u_phone_number,
      u_status: user.u_status,
      u_password: '' // Password is not pre-filled for security
    });
    setIsModalOpen(true);
  };

  // Submit user form (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (currentUser) {
        // Update existing user
        response = await fetch(`http://localhost:3000/users/${currentUser.sys_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new user
        response = await fetch('http://localhost:3000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) throw new Error('Failed to save user');

      // Refresh users list
      const updatedResponse = await fetch('http://localhost:3000/users');
      const updatedData = await updatedResponse.json();
      setUsers(updatedData);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Delete user
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/users/${userToDelete.sys_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      // Refresh users list
      const updatedResponse = await fetch('http://localhost:3000/users');
      const updatedData = await updatedResponse.json();
      setUsers(updatedData);
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (user) => {
    try {
      const newStatus = user.u_status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`http://localhost:3000/users/${user.sys_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ u_status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update user status');

      // Refresh users list
      const updatedResponse = await fetch('http://localhost:3000/users');
      const updatedData = await updatedResponse.json();
      setUsers(updatedData);
    } catch (err) {
      setError(err.message);
    }
  };

  // Get role distribution data
  const getRoleDistribution = () => {
    const roleCounts = users.reduce((acc, user) => {
      acc[user.u_role] = (acc[user.u_role] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(roleCounts),
      datasets: [{
        data: Object.values(roleCounts),
        backgroundColor: [
          colors.primary,
          colors.secondary,
          colors.success,
          colors.warning,
          colors.danger,
          colors.info
        ],
        borderWidth: 1
      }]
    };
  };

  // Get status distribution data
  const getStatusDistribution = () => {
    const statusCounts = users.reduce((acc, user) => {
      acc[user.u_status] = (acc[user.u_status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [colors.success, colors.danger],
        borderWidth: 1
      }]
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#007B98]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#007B98] text-white rounded hover:bg-[#006080] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#007B98]">User Management System</h1>
            <p className="text-gray-600">Manage all system users, roles and permissions</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={openNewUserModal}
              className="px-4 py-2 bg-[#007B98] text-white rounded-md hover:bg-[#006080] transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New User
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
          {['users', 'roles', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab 
                  ? 'bg-[#007B98] text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B98] focus:border-[#007B98]"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B98] focus:border-[#007B98]"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B98] focus:border-[#007B98]"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Roles</option>
                  {[...new Set(users.map(user => user.u_role))].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.sys_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#007B98] flex items-center justify-center text-white font-medium">
                              {user.u_name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.u_name}</div>
                              <div className="text-sm text-gray-500">{user.u_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.u_role)}`}>
                            {user.u_role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.u_status)}`}>
                            {user.u_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.u_last_login ? new Date(user.u_last_login).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditUserModal(user)}
                              className="text-[#007B98] hover:text-[#006080] p-1"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user)}
                              className={`p-1 ${user.u_status === 'active' ? 'text-[#D9534F] hover:text-[#C9302C]' : 'text-[#5CB85C] hover:text-[#449D44]'}`}
                              title={user.u_status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {user.u_status === 'active' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.828-2.829m0 0l2.829-2.829m0 0L5.636 5.636" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="text-[#D9534F] hover:text-[#C9302C] p-1"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{' '}
                      <span className="font-medium">{filteredUsers.length}</span> users
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">First</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-[#007B98] border-[#007B98] text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Last</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-[#007B98] mb-4">Roles & Permissions</h2>
            <p className="text-gray-600 mb-6">Manage user roles and their system permissions</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {['admin', 'product manager', 'data analyst', 'comercial', 'client'].map((role) => (
                    <tr key={role} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getRoleColor(role)}`}>
                          {role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {role === 'admin' && 'Full system access with all permissions'}
                          {role === 'product manager' && 'Manage products, categories and offerings'}
                          {role === 'data analyst' && 'View analytics and generate reports'}
                          {role === 'comercial' && 'Manage sales and customer relationships'}
                          {role === 'client' && 'Basic access with limited permissions'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {role === 'admin' && (
                            <>
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">All Permissions</span>
                            </>
                          )}
                          {role === 'product manager' && (
                            <>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">View Products</span>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Create Products</span>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Edit Products</span>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Delete Products</span>
                            </>
                          )}
                          {role === 'data analyst' && (
                            <>
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">View Analytics</span>
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Generate Reports</span>
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Export Data</span>
                            </>
                          )}
                          {role === 'comercial' && (
                            <>
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">View Products</span>
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Manage Orders</span>
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">View Customers</span>
                            </>
                          )}
                          {role === 'client' && (
                            <>
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">View Products</span>
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Place Orders</span>
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">View Profile</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {users.filter(u => u.u_role === role).length} users
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/roles/edit/${role.toLowerCase().replace(' ', '-')}`)}
                          className="text-[#007B98] hover:text-[#006080] mr-3"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Permission Groups</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Products', 'Users', 'Analytics', 'Orders', 'Settings', 'Reports'].map((group) => (
                <div key={group} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{group}</h4>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`toggle-${group}`}
                        className="sr-only"
                      />
                      <label 
                        htmlFor={`toggle-${group}`}
                        className="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007B98]"
                      >
                        <span className="sr-only">Enable {group} permissions</span>
                        <span className="inline-block w-4 h-4 transform bg-white rounded-full transition translate-x-1" />
                      </label>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {['View', 'Create', 'Edit', 'Delete'].map((action) => (
                      <li key={action} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{action} {group}</span>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-[#007B98] focus:ring-[#007B98] border-gray-300 rounded"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Role Distribution</h3>
              <div className="h-80">
                <Pie
                  data={getRoleDistribution()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right'
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Status Distribution</h3>
              <div className="h-80">
                <Bar
                  data={getStatusDistribution()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Users'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Status'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Activity</h3>
            <div className="h-96">
              <Bar
                data={{
                  labels: users.map(user => user.u_name),
                  datasets: [{
                    label: 'Last Login (Days Ago)',
                    data: users.map(user => {
                      if (!user.u_last_login) return 365; // Never logged in
                      const diffTime = Math.abs(new Date() - new Date(user.u_last_login));
                      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }),
                    backgroundColor: users.map(user => 
                      user.u_status === 'active' ? colors.primary : colors.danger
                    ),
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Days Since Last Login'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'User'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const user = users[context.dataIndex];
                          const label = user.u_name;
                          const value = context.raw;
                          const status = user.u_status;
                          return `${label}: ${value} days (${status})`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {currentUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="u_name"
                      value={formData.u_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B98] focus:border-[#007B98]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="u_email"
                      value={formData.u_email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B98] focus:border-[#007B98]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="u_phone_number"
                      value={formData.u_phone_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B98] focus:border-[#007B98]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="u_role"
                      value={formData.u_role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B98] focus:border-[#007B98]"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="product manager">Product Manager</option>
                      <option value="data analyst">Data Analyst</option>
                      <option value="comercial">Comercial</option>
                      <option value="client">Client</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="u_status"
                      value={formData.u_status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B98] focus:border-[#007B98]"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {currentUser ? 'New Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      name="u_password"
                      value={formData.u_password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B98] focus:border-[#007B98]"
                      minLength={currentUser ? 0 : 4}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#007B98] text-white rounded-md text-sm font-medium hover:bg-[#006080]"
                  >
                    {currentUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete user <span className="font-semibold">{userToDelete?.u_name}</span>? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-[#D9534F] text-white rounded-md text-sm font-medium hover:bg-[#C9302C]"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;