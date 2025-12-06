import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminHospitalsPage = () => {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bloodBankCapacity: 100,
    departments: '',
    emergencyContact: '',
    website: '',
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllHospitals();
      setHospitals(data.hospitals || []);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      bloodBankCapacity: 100,
      departments: '',
      emergencyContact: '',
      website: '',
    });
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const hospitalData = {
        ...formData,
        departments: formData.departments.split(',').map(d => d.trim()).filter(Boolean),
        bloodBankCapacity: parseInt(formData.bloodBankCapacity) || 100,
      };
      await adminService.createHospital(hospitalData);
      toast.success('Hospital created successfully!');
      setShowAddModal(false);
      resetForm();
      fetchHospitals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create hospital');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditHospital = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const hospitalData = {
        ...formData,
        departments: typeof formData.departments === 'string' 
          ? formData.departments.split(',').map(d => d.trim()).filter(Boolean)
          : formData.departments,
        bloodBankCapacity: parseInt(formData.bloodBankCapacity) || 100,
      };
      await adminService.updateHospitalById(selectedHospital._id, hospitalData);
      toast.success('Hospital updated successfully!');
      setShowEditModal(false);
      setSelectedHospital(null);
      resetForm();
      fetchHospitals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update hospital');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (hospital) => {
    setSelectedHospital(hospital);
    setFormData({
      name: hospital.name || '',
      code: hospital.code || '',
      email: hospital.email || '',
      phone: hospital.phone || '',
      address: hospital.address || '',
      city: hospital.city || '',
      state: hospital.state || '',
      zipCode: hospital.zipCode || '',
      bloodBankCapacity: hospital.bloodBankCapacity || 100,
      departments: Array.isArray(hospital.departments) ? hospital.departments.join(', ') : '',
      emergencyContact: hospital.emergencyContact || '',
      website: hospital.website || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteHospital = async (hospitalId) => {
    if (!window.confirm('Are you sure you want to deactivate this hospital?')) {
      return;
    }
    try {
      await adminService.deleteHospital(hospitalId);
      toast.success('Hospital deactivated successfully');
      fetchHospitals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate hospital');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Hospital Management
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage hospitals and their details
          </p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
          + Add Hospital
        </Button>
      </div>

      {hospitals.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-neutral-500">
            <div className="text-6xl mb-4">🏥</div>
            <p className="text-lg mb-2">No hospitals found</p>
            <p className="text-sm">Add a hospital to get started</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {hospitals.map((hospital) => (
            <Card key={hospital._id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      {hospital.name}
                    </h3>
                    <Badge variant={hospital.isActive ? 'success' : 'error'}>
                      {hospital.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="primary">{hospital.code}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Location</p>
                      <p className="text-neutral-700">{hospital.city}, {hospital.state}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Contact</p>
                      <p className="text-neutral-700">{hospital.phone}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Blood Bank Capacity</p>
                      <p className="text-neutral-700">{hospital.bloodBankCapacity} units</p>
                    </div>
                  </div>
                  {hospital.departments && hospital.departments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-neutral-500 mb-1">Departments</p>
                      <div className="flex flex-wrap gap-1">
                        {hospital.departments.map((dept, idx) => (
                          <Badge key={idx} variant="secondary" size="sm">{dept}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(hospital)}>
                    Edit
                  </Button>
                  {hospital.isActive && (
                    <Button variant="danger" size="sm" onClick={() => handleDeleteHospital(hospital._id)}>
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Hospital"
        size="lg"
      >
        <form onSubmit={handleAddHospital} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Hospital Name" name="name" value={formData.name} onChange={handleChange} placeholder="City General Hospital" required />
            <Input label="Hospital Code" name="code" value={formData.code} onChange={handleChange} placeholder="CGH" required />
            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@hospital.com" required />
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" required />
            <Input label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="+1 (555) 000-0001" />
          </div>
          <Input label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Medical Drive" required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="New York" required />
            <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="NY" required />
            <Input label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="10001" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Blood Bank Capacity (units)" type="number" name="bloodBankCapacity" value={formData.bloodBankCapacity} onChange={handleChange} min="1" />
            <Input label="Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://hospital.com" />
          </div>
          <Input label="Departments (comma-separated)" name="departments" value={formData.departments} onChange={handleChange} placeholder="Emergency, Blood Bank, Surgery" />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={formLoading}>{formLoading ? 'Creating...' : 'Create Hospital'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedHospital(null); }}
        title="Edit Hospital"
        size="lg"
      >
        <form onSubmit={handleEditHospital} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Hospital Name" name="name" value={formData.name} onChange={handleChange} placeholder="City General Hospital" required />
            <Input label="Hospital Code" name="code" value={formData.code} onChange={handleChange} placeholder="CGH" disabled />
            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@hospital.com" required />
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" required />
            <Input label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="+1 (555) 000-0001" />
          </div>
          <Input label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Medical Drive" required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="New York" required />
            <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="NY" required />
            <Input label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="10001" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Blood Bank Capacity (units)" type="number" name="bloodBankCapacity" value={formData.bloodBankCapacity} onChange={handleChange} min="1" />
            <Input label="Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://hospital.com" />
          </div>
          <Input label="Departments (comma-separated)" name="departments" value={formData.departments} onChange={handleChange} placeholder="Emergency, Blood Bank, Surgery" />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setShowEditModal(false); setSelectedHospital(null); }}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminHospitalsPage;
