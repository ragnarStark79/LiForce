import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { isValidPassword } from '../../utils/validators';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const token = searchParams.get('token');
    if (!token) {
      setErrors({ general: 'Invalid reset link' });
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, formData.password);
      navigate('/login', { state: { message: 'Password reset successfully! Please log in.' } });
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-800 mb-2">
        Reset Password
      </h2>
      <p className="text-neutral-600 mb-6">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-danger-50 text-danger-700 px-4 py-3 rounded-soft text-sm">
            {errors.general}
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter new password"
          error={errors.password}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm new password"
          error={errors.confirmPassword}
          required
        />

        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          loading={loading}
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
