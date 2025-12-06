import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Checkbox from '../../components/common/Checkbox';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getRedirectPath = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'STAFF':
        return '/staff/dashboard';
      case 'USER':
      default:
        return '/user/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const user = await login({ email: formData.email, password: formData.password });
      const redirectPath = getRedirectPath(user.role);
      navigate(redirectPath);
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Login failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">
        Welcome Back
      </h2>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errors.general}
        </div>
      )}

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <p className="font-medium text-blue-800 mb-2">Demo Accounts:</p>
        <div className="text-blue-700 space-y-1">
          <p><strong>Admin:</strong> admin@liforce.com / Admin@123456</p>
          <p><strong>Staff:</strong> staff@liforce.com / Staff@123456</p>
          <p><strong>User:</strong> user@liforce.com / User@123456</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          error={errors.password}
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <Link 
            to="/forgot-password" 
            className="text-sm text-red-600 hover:text-red-700"
          >
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          fullWidth 
          loading={loading}
          disabled={loading}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-red-600 hover:text-red-700 font-medium">
          Register as Donor
        </Link>
        {' or '}
        <Link to="/register-staff" className="text-red-600 hover:text-red-700 font-medium">
          Join as Staff
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;