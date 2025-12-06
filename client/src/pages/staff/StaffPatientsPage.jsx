import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { staffService } from '../../services/staffService';
import { BLOOD_GROUPS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StaffPatientsPage = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'MALE',
    bloodGroup: 'A+',
    phone: '',
    address: '',
    medicalHistory: '',
    currentCondition: '',
  });

  useEffect(() => {
    fetchPatients();
  }, [currentPage, bloodGroupFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
      if (searchTerm) params.search = searchTerm;
      
      const data = await staffService.getPatients(params);
      setPatients(data.patients || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPatients();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'MALE',
      bloodGroup: 'A+',
      phone: '',
      address: '',
      medicalHistory: '',
      currentCondition: '',
    });
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await staffService.addPatient(formData);
      toast.success('Patient added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add patient');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await staffService.updatePatient(selectedPatient._id, formData);
      toast.success('Patient updated successfully!');
      setShowEditModal(false);
      setSelectedPatient(null);
      resetForm();
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update patient');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
      await staffService.deletePatient(patientId);
      toast.success('Patient deleted successfully!');
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete patient');
    }
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || 'MALE',
      bloodGroup: patient.bloodGroup || 'A+',
      phone: patient.phone || '',
      address: patient.address || '',
      medicalHistory: patient.medicalHistory || '',
      currentCondition: patient.currentCondition || '',
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: 'success',
      CRITICAL: 'error',
      STABLE: 'info',
      DISCHARGED: 'secondary',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const PatientForm = ({ onSubmit, isEdit = false }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Patient Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Age"
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          required
        />
        <Select
          label="Gender"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          options={[
            { value: 'MALE', label: 'Male' },
            { value: 'FEMALE', label: 'Female' },
            { value: 'OTHER', label: 'Other' },
          ]}
        />
        <Select
          label="Blood Group"
          value={formData.bloodGroup}
          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
          options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
        />
        <Input
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <Input
        label="Medical History"
        value={formData.medicalHistory}
        onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
        placeholder="Any relevant medical history..."
      />
      <Input
        label="Current Condition"
        value={formData.currentCondition}
        onChange={(e) => setFormData({ ...formData, currentCondition: e.target.value })}
        placeholder="Current medical condition or reason for admission..."
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            isEdit ? setShowEditModal(false) : setShowAddModal(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={formLoading}>
          {formLoading ? 'Saving...' : isEdit ? 'Update Patient' : 'Add Patient'}
        </Button>
      </div>
    </form>
  );

  if (loading && patients.length === 0) {
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
            Patients
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage patients and their blood requirements
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          + Add Patient
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search patients by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            options={[
              { value: '', label: 'All Blood Groups' },
              ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg })),
            ]}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      {/* Patients List */}
      <Card>
        {patients.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-lg mb-2">No patients found</p>
            <p className="text-sm">Add a patient to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Blood Group</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Age/Gender</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Admitted</th>
                  <th className="text-right py-3 px-4 font-semibold text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-800">{patient.name}</p>
                        <p className="text-sm text-neutral-500">{patient.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary">{patient.bloodGroup}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-600">
                        {patient.age} yrs / {patient.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(patient.status || 'ACTIVE')}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {formatDate(patient.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditModal(patient)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeletePatient(patient._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Add Patient Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Patient"
        size="lg"
      >
        <PatientForm onSubmit={handleAddPatient} />
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPatient(null);
          resetForm();
        }}
        title="Edit Patient"
        size="lg"
      >
        <PatientForm onSubmit={handleEditPatient} isEdit />
      </Modal>
    </div>
  );
};

export default StaffPatientsPage;
