import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { STAFF_POSITIONS, BLOOD_GROUPS } from '../../utils/constants';
import { authService } from '../../services/authService';
import apiClient from '../../services/apiClient';

const RegisterStaffPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    hospitalId: '',
    position: '',
    department: '',
    bloodGroup: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setHospitalsLoading(true);
      const response = await apiClient.get('/hospitals/public');
      setHospitals(response.data.hospitals || []);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
      try {
        const response = await apiClient.get('/hospitals');
        setHospitals(response.data.hospitals || []);
      } catch (err) {
        setErrors({ general: 'Unable to load hospitals. Please try again later.' });
      }
    } finally {
      setHospitalsLoading(false);
    }
  };

  const hospitalOptions = hospitals.map(hospital => ({
    value: hospital._id,
    label: `${hospital.name} (${hospital.code})`,
  }));

  const positionOptions = STAFF_POSITIONS.map(pos => ({
    value: pos,
    label: pos,
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

    if (!formData.hospitalId) {
      setErrors({ hospitalId: 'Please select a hospital' });
      setLoading(false);
      return;
    }

    try {
      const staffData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        hospitalId: formData.hospitalId,
        staffPosition: formData.position,
        department: formData.department,
        bloodGroup: formData.bloodGroup,
      };
      
      await authService.registerStaff(staffData);
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please wait for admin approval to login.' 
        } 
      });
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (hospitalsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-neutral-800 mb-2 text-center">
        Register as Staff
      </h2>
      <p className="text-sm text-neutral-600 mb-6 text-center">
        Your account will be pending until approved by an administrator
      </p>

      {errors.general && (
        <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-soft text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Dr. Jane Smith"
          required
          error={errors.name}
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jane.smith@hospital.com"
          required
          error={errors.email}
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
        />

        <Select
          label="Blood Group"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleChange}
          options={[
            { value: '', label: 'Select Blood Group' },
            ...BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))
          ]}
          error={errors.bloodGroup}
        />

        <Select
          label="Hospital"
          name="hospitalId"
          value={formData.hospitalId}
          onChange={handleChange}
          options={hospitalOptions}
          placeholder="Select your hospital"
          required
          error={errors.hospitalId}
        />

        <Select
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          options={positionOptions}
          placeholder="Select your position"
          required
          error={errors.position}
        />

        <Input
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="e.g., Emergency, Blood Bank"
          required
          error={errors.department}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Minimum 8 characters"
          required
          error={errors.password}
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
        />

        <Button 
          type="submit" 
          fullWidth 
          loading={loading}
          disabled={loading || hospitals.length === 0}
        >
          Register as Staff
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-smooth">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterStaffPage;