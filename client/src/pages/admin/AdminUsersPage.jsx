import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { adminService } from '../../services/adminService';
import { BLOOD_GROUPS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const AdminUsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDonors: 0,
    newThisMonth: 0,
    totalDonations: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  
  // Filters
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, bloodGroupFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        bloodGroup: bloodGroupFilter || undefined,
        status: statusFilter || undefined,
      });
      
      setUsers(response.users || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        pages: response.pages || 0,
      }));
      setStats({
        totalUsers: response.totalUsers || response.total || 0,
        activeDonors: response.activeDonors || 0,
        newThisMonth: response.newThisMonth || 0,
        totalDonations: response.totalDonations || 0,
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSuspendUser = async (userId) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    
    try {
      setActionLoading(true);
      await adminService.suspendUser(userId);
      fetchUsers();
      if (showUserModal) {
        setSelectedUser(prev => prev ? { ...prev, status: 'suspended' } : null);
      }
    } catch (error) {
      console.error('Failed to suspend user:', error);
      alert('Failed to suspend user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      setActionLoading(true);
      await adminService.activateUser(userId);
      fetchUsers();
      if (showUserModal) {
        setSelectedUser(prev => prev ? { ...prev, status: 'active' } : null);
      }
    } catch (error) {
      console.error('Failed to activate user:', error);
      alert('Failed to activate user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'suspended':
        return <Badge variant="danger">Suspended</Badge>;
      case 'inactive':
        return <Badge variant="warning">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const bloodGroupOptions = [
    { value: '', label: 'All Blood Groups' },
    ...BLOOD_GROUPS.map(bg => ({ value: bg, label: bg })),
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            User Management
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage registered blood donors
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={bloodGroupFilter}
            onChange={(e) => {
              setBloodGroupFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            options={bloodGroupOptions}
          />
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            options={statusOptions}
          />
          <Button type="submit" variant="secondary" fullWidth>
            Search
          </Button>
        </form>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">{stats.totalUsers}</div>
          <p className="text-sm text-neutral-600 mt-2">Total Users</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-success-600">{stats.activeDonors}</div>
          <p className="text-sm text-neutral-600 mt-2">Active Donors</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-secondary-600">{stats.newThisMonth}</div>
          <p className="text-sm text-neutral-600 mt-2">New This Month</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent-600">{stats.totalDonations}</div>
          <p className="text-sm text-neutral-600 mt-2">Total Donations</p>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Registered Users
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">User</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Blood Group</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Phone</th>
                    <th className="text-center py-3 px-4 font-medium text-neutral-600">Donations</th>
                    <th className="text-center py-3 px-4 font-medium text-neutral-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Joined</th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            src={user.avatar} 
                            name={`${user.firstName} ${user.lastName}`}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-neutral-800">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-neutral-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="primary">{user.bloodGroup || 'N/A'}</Badge>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {user.phone || 'N/A'}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-medium text-neutral-800">
                          {user.donationCount || 0}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        {getStatusBadge(user.status || 'active')}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            View
                          </Button>
                          {user.status === 'suspended' ? (
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleActivateUser(user._id)}
                              disabled={actionLoading}
                            >
                              Activate
                            </Button>
                          ) : (
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleSuspendUser(user._id)}
                              disabled={actionLoading}
                            >
                              Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pagination.pages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-neutral-500">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-lg mb-2">No users found</p>
            <p className="text-sm">Registered donors will appear here</p>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar 
                src={selectedUser.avatar} 
                name={`${selectedUser.firstName} ${selectedUser.lastName}`}
                size="lg"
              />
              <div>
                <h3 className="text-xl font-semibold text-neutral-800">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-neutral-600">{selectedUser.email}</p>
                {getStatusBadge(selectedUser.status || 'active')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-500">Blood Group</p>
                <p className="text-lg font-semibold text-primary-600">
                  {selectedUser.bloodGroup || 'Not specified'}
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-500">Phone</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {selectedUser.phone || 'Not provided'}
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-500">Total Donations</p>
                <p className="text-lg font-semibold text-success-600">
                  {selectedUser.donationCount || 0}
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-500">Member Since</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
            </div>

            {selectedUser.address && (
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-500">Address</p>
                <p className="text-neutral-800">
                  {selectedUser.address.street && `${selectedUser.address.street}, `}
                  {selectedUser.address.city && `${selectedUser.address.city}, `}
                  {selectedUser.address.state && `${selectedUser.address.state} `}
                  {selectedUser.address.zipCode}
                </p>
              </div>
            )}

            {selectedUser.lastDonation && (
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-500">Last Donation</p>
                <p className="text-neutral-800">{formatDate(selectedUser.lastDonation)}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="secondary" 
                onClick={() => setShowUserModal(false)}
              >
                Close
              </Button>
              {selectedUser.status === 'suspended' ? (
                <Button 
                  variant="success"
                  onClick={() => handleActivateUser(selectedUser._id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Activate User'}
                </Button>
              ) : (
                <Button 
                  variant="danger"
                  onClick={() => handleSuspendUser(selectedUser._id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Suspend User'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
