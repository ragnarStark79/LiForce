import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { staffService } from '../../services/staffService';
import { BLOOD_GROUPS } from '../../utils/constants';
import toast from 'react-hot-toast';

const StaffInventoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: 'A+',
    units: 1,
    action: 'ADD',
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const data = await staffService.getInventory();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const updateData = {
        bloodGroup: formData.bloodGroup,
        operation: formData.action === 'ADD' ? 'add' : 'subtract',
        units: formData.units,
      };
      await staffService.updateInventory(updateData);
      toast.success('Stock updated successfully!');
      setShowUpdateModal(false);
      setFormData({ bloodGroup: 'A+', units: 1, action: 'ADD' });
      fetchInventoryData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setFormLoading(false);
    }
  };

  const getStockStatus = (units) => {
    if (units === 0) return { variant: 'error', label: 'Out of Stock' };
    if (units < 5) return { variant: 'warning', label: 'Low Stock' };
    if (units < 10) return { variant: 'info', label: 'Moderate' };
    return { variant: 'success', label: 'Good Stock' };
  };

  const getInventoryForBloodGroup = (bloodGroup) => {
    const item = inventory.find((i) => i.bloodGroup === bloodGroup);
    return item?.unitsAvailable || 0;
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
          <h1 className="text-3xl font-display font-bold text-neutral-800">Blood Inventory</h1>
          <p className="text-neutral-600 mt-2">Manage blood stock levels for your hospital</p>
        </div>
        <Button variant="primary" onClick={() => setShowUpdateModal(true)}>+ Update Stock</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-primary-50 to-primary-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-700">
              {inventory.reduce((sum, item) => sum + (item.unitsAvailable || 0), 0)}
            </div>
            <p className="text-sm text-primary-600 mt-1">Total Units</p>
          </div>
        </Card>
        <Card className="bg-linear-to-br from-green-50 to-green-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">
              {inventory.filter((i) => (i.unitsAvailable || 0) >= 10).length}
            </div>
            <p className="text-sm text-green-600 mt-1">Well Stocked</p>
          </div>
        </Card>
        <Card className="bg-linear-to-br from-yellow-50 to-yellow-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-700">
              {inventory.filter((i) => (i.unitsAvailable || 0) > 0 && (i.unitsAvailable || 0) < 5).length}
            </div>
            <p className="text-sm text-yellow-600 mt-1">Low Stock</p>
          </div>
        </Card>
        <Card className="bg-linear-to-br from-red-50 to-red-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-700">
              {inventory.filter((i) => (i.unitsAvailable || 0) === 0).length}
            </div>
            <p className="text-sm text-red-600 mt-1">Out of Stock</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {BLOOD_GROUPS.map((bloodGroup) => {
          const units = getInventoryForBloodGroup(bloodGroup);
          const status = getStockStatus(units);
          return (
            <Card key={bloodGroup} className="text-center hover:shadow-md transition-shadow">
              <div className="text-4xl font-bold text-primary-600 mb-2">{units}</div>
              <p className="text-lg font-semibold text-neutral-700 mb-2">{bloodGroup}</p>
              <Badge variant={status.variant} size="sm">{status.label}</Badge>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} title="Update Blood Stock">
        <form onSubmit={handleUpdateStock} className="space-y-4">
          <Select
            label="Blood Group"
            value={formData.bloodGroup}
            onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
            options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
          />
          <Select
            label="Action"
            value={formData.action}
            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
            options={[
              { value: 'ADD', label: 'Add Units (Donation/Transfer In)' },
              { value: 'REMOVE', label: 'Remove Units (Used/Expired/Transfer Out)' },
            ]}
          />
          <Input
            label="Units"
            type="number"
            min="1"
            value={formData.units}
            onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading ? 'Updating...' : 'Update Stock'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffInventoryPage;
