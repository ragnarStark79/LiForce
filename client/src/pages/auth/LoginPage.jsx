import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../components/common/NotificationSystem';
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
  const [showDemo, setShowDemo] = useState(false);

  const { login } = useAuth();
  const { notify } = useNotification();
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
      notify.login(user.name);
      const redirectPath = getRedirectPath(user.role);
      navigate(redirectPath);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ general: message });
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/60 shadow-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }} />
          <span className="text-xs font-semibold text-slate-700">Secure sign-in</span>
        </div>
        <h2 className="mt-4 v2-title">Welcome back</h2>
        <p className="mt-2 v2-subtitle">Sign in to your dashboard and continue your impact.</p>
      </div>

      {/* Error */}
      {errors.general && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="font-semibold">Unable to sign in</div>
          <div className="mt-1 opacity-90">{errors.general}</div>
        </div>
      )}

      {/* Demo accounts: collapsed drawer */}
      <div className="rounded-2xl border border-slate-200 bg-white/60 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDemo(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left v2-tap"
        >
          <div>
            <div className="text-sm font-semibold text-slate-900">Demo accounts</div>
            <div className="text-xs text-slate-600">Tap to {showDemo ? 'hide' : 'reveal'} credentials</div>
          </div>
          <span className="text-slate-500" aria-hidden>
            {showDemo ? '▴' : '▾'}
          </span>
        </button>
        {showDemo && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-900">Admin</div>
                <div className="mt-2 text-xs text-slate-600">admin@liforce.com</div>
                <div className="text-xs text-slate-600">Admin@123456</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-900">Staff</div>
                <div className="mt-2 text-xs text-slate-600">staff@liforce.com</div>
                <div className="text-xs text-slate-600">Staff@123456</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-900">User</div>
                <div className="mt-2 text-xs text-slate-600">user@liforce.com</div>
                <div className="text-xs text-slate-600">User@123456</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@domain.com"
          required
          error={errors.email}
          className="v2-focus"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Your password"
          required
          error={errors.password}
          className="v2-focus"
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <Link to="/forgot-password" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
          className="rounded-2xl py-3"
        >
          Sign in
        </Button>
      </form>

      {/* Footer links */}
      <div className="pt-2 text-center text-sm text-slate-600">
        <span>New here?</span>{' '}
        <Link to="/register" className="font-semibold text-red-600 hover:text-red-700">Register as Donor</Link>
        {' or '}
        <Link to="/register-staff" className="font-semibold text-red-600 hover:text-red-700">Join as Staff</Link>
      </div>
    </div>
  );
};

export default LoginPage;