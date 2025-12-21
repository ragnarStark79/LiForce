import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { BLOOD_GROUPS } from '../../utils/constants';
import toast from 'react-hot-toast';

const RegisterUserPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    city: '',
    state: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const bloodGroupOptions = BLOOD_GROUPS.map(bg => ({
    value: bg,
    label: bg,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      await register({ ...formData, role: 'USER' });
      toast.success('Registration successful! Welcome to LifeForce.');
      navigate('/user/dashboard');
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/60 shadow-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6)' }} />
          <span className="text-xs font-semibold text-slate-700">Create donor account</span>
        </div>
        <h2 className="mt-4 v2-title">Register as Donor</h2>
        <p className="mt-2 v2-subtitle">A modern profile helps hospitals match donors faster.</p>
      </div>

      {errors.general && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section: identity */}
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
          <div className="text-sm font-semibold text-slate-900">Profile basics</div>
          <div className="text-xs text-slate-600 mt-1">Used for verification and contact.</div>

          <div className="mt-4 space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              error={errors.name}
              className="v2-focus"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                error={errors.email}
                className="v2-focus"
              />

              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                required
                error={errors.phone}
                className="v2-focus"
              />
            </div>
          </div>
        </div>

        {/* Section: donor details */}
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
          <div className="text-sm font-semibold text-slate-900">Donor details</div>
          <div className="text-xs text-slate-600 mt-1">Helps with matching and scheduling.</div>

          <div className="mt-4 space-y-4">
            <Select
              label="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              options={bloodGroupOptions}
              placeholder="Select your blood group"
              required
              error={errors.bloodGroup}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                required
                error={errors.city}
                className="v2-focus"
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="NY"
                required
                error={errors.state}
                className="v2-focus"
              />
            </div>
          </div>
        </div>

        {/* Section: security */}
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
          <div className="text-sm font-semibold text-slate-900">Security</div>
          <div className="text-xs text-slate-600 mt-1">Choose a strong password.</div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              required
              error={errors.password}
              className="v2-focus"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              error={errors.confirmPassword}
              className="v2-focus"
            />
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
          className="rounded-2xl py-3"
        >
          Create account
        </Button>
      </form>

      <div className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-red-600 hover:text-red-700">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterUserPage;
