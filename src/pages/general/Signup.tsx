import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, Stethoscope, Eye, EyeOff } from 'lucide-react';

interface FormData {
  role: 'user' | 'provider';
  id: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    role: 'user',
    id: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData> & { general?: string }>({});

  useEffect(() => {
    const savedRole = localStorage.getItem('selectedRole') as 'user' | 'provider';
    if (savedRole) {
      setFormData(prev => ({ ...prev, role: savedRole }));
    }
  }, []);

  const validateForm = () => {
    const newErrors: Partial<FormData> & { general?: string } = {};

    if (!formData.id) newErrors.id = `${formData.role === 'user' ? 'Patient' : 'Provider'} ID is required`;
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData);
      navigate('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            {formData.role === 'user' ? (
              <UserCircle className="w-16 h-16 text-blue-500" />
            ) : (
              <Stethoscope className="w-16 h-16 text-indigo-500" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Role</label>
            <div className="flex gap-4">
              <label className="flex items-center flex-1 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'provider' })}
                  className="mr-2"
                />
                <span>User</span>
              </label>
              <label className="flex items-center flex-1 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value="provider"
                  checked={formData.role === 'provider'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'provider' })}
                  className="mr-2"
                />
                <span>Provider</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {formData.role === 'user' ? 'User ID' : 'Provider ID'}
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.id ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            />
            {errors.id && <p className="mt-1 text-sm text-red-600">{errors.id}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {formData.role === 'user' ? 'User Name' : 'Provider Name'}
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div> 
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-4 top-2 h-5 w-5 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div> 
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-4 top-2 h-5 w-5 text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;