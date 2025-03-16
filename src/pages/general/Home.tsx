import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Stethoscope, ShieldCheck } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'user' | 'provider' | 'admin') => {
    // Navigate to the role-specific login page
    navigate(`/login/${role}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-6xl">
        {/* Title Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Welcome to Valid8</h1>
          <p className="text-xl text-gray-600">Choose your role to continue</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid max-w-4xl gap-8 mx-auto md:grid-cols-3">
          {/* User Card */}
          <button
            onClick={() => handleRoleSelect('user')}
            className="p-8 text-center transition-all duration-200 transform bg-white shadow-lg group rounded-2xl hover:shadow-xl hover:scale-105"
          >
            <div className="flex justify-center mb-6">
              <UserCircle className="w-20 h-20 text-blue-500 group-hover:text-blue-600" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">User</h2>
            <p className="text-gray-600">
              Track your health metrics and connect with healthcare providers
            </p>
          </button>

          {/* Provider Card */}
          <button
            onClick={() => handleRoleSelect('provider')}
            className="p-8 text-center transition-all duration-200 transform bg-white shadow-lg group rounded-2xl hover:shadow-xl hover:scale-105"
          >
            <div className="flex justify-center mb-6">
              <Stethoscope className="w-20 h-20 text-indigo-500 group-hover:text-indigo-600" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Provider</h2>
            <p className="text-gray-600">
              Monitor and manage device data effectively
            </p>
          </button>

          {/* Admin Card */}
          <button
            onClick={() => handleRoleSelect('admin')}
            className="p-8 text-center transition-all duration-200 transform bg-white shadow-lg group rounded-2xl hover:shadow-xl hover:scale-105"
          >
            <div className="flex justify-center mb-6">
              <ShieldCheck className="w-20 h-20 text-red-500 group-hover:text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Admin</h2>
            <p className="text-gray-600">
              Manage system users and oversee all operations
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
