import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { authService } from '../../services/authService';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-neutral-800 mb-6">
        Email Verification
      </h2>

      {status === 'verifying' && (
        <div className="py-8">
          <LoadingSpinner size="lg" />
          <p className="text-neutral-600 mt-4">Verifying your email...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-8">
          <div className="text-6xl mb-4">✓</div>
          <p className="text-success-600 font-medium mb-6">{message}</p>
          <Button onClick={() => navigate('/login')} variant="primary">
            Go to Login
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="py-8">
          <div className="text-6xl mb-4">✕</div>
          <p className="text-danger-600 font-medium mb-6">{message}</p>
          <Button onClick={() => navigate('/login')} variant="secondary">
            Back to Login
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage;
