import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { isValidEmail } from '../../utils/validators';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">
          Check Your Email
        </h2>
        <div className="text-6xl mb-4">📧</div>
        <p className="text-neutral-600 mb-6">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-neutral-500 mb-6">
          Please check your email and follow the instructions to reset your password.
        </p>
        <Link to="/login">
          <Button variant="secondary" fullWidth>
            Back to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-800 mb-2">
        Forgot Password
      </h2>
      <p className="text-neutral-600 mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          error={error}
          required
        />

        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          loading={loading}
        >
          Send Reset Link
        </Button>

        <div className="text-center">
          <Link 
            to="/login" 
            className="text-sm text-primary-600 hover:text-primary-700 transition-smooth"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
