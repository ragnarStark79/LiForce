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
import toast from 'react-hot-toast';

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
        pages: response.totalPages || 0,
      }));
      setStats({
        totalUsers: response.totalUsers || response.total || 0,
        activeDonors: response.activeDonors || 0,
        newThisMonth: response.newThisMonth || 0,
        totalDonations: response.totalDonations || 0,
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
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
      toast.success('User suspended successfully');
      // Update local state immediately
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: 'SUSPENDED' } : u));
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status: 'SUSPENDED' } : null);
      }
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast.error('Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      setActionLoading(true);
      await adminService.activateUser(userId);
      toast.success('User activated successfully');
      // Update local state immediately
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: 'ACTIVE' } : u));
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status: 'ACTIVE' } : null);
      }
    } catch (error) {
      console.error('Failed to activate user:', error);
      toast.error('Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusUpper = (status || 'ACTIVE').toUpperCase();
    switch (statusUpper) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'SUSPENDED':
        return <Badge variant="danger">Suspended</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Check if user is suspended (handles both cases)
  const isUserSuspended = (user) => {
    const status = (user.status || 'ACTIVE').toUpperCase();
    return status === 'SUSPENDED';
  };

  const bloodGroupOptions = [
    { value: '', label: 'All Blood Groups' },
    ...BLOOD_GROUPS.map(bg => ({ value: bg, label: bg })),
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SUSPENDED', label: 'Suspended' },
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
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Location</th>
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
                            name={user.name}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-neutral-800">
                              {user.name}
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
                      <td className="py-3 px-4 text-neutral-600">
                        {user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state || 'N/A'}
                      </td>
                      <td className="text-center py-3 px-4">
                        {getStatusBadge(user.status)}
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
                          {isUserSuspended(user) ? (
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
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar 
                src={selectedUser.avatar} 
                name={selectedUser.name}
                size="lg"
              />
              <div>
                <h3 className="text-xl font-semibold text-neutral-800">
                  {selectedUser.name}
                </h3>
                <p className="text-neutral-600">{selectedUser.email}</p>
                <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
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
                <p className="text-sm text-neutral-500">Email Verified</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {selectedUser.isEmailVerified ? '✅ Yes' : '❌ No'}
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-500">Member Since</p>
                <p className="text-lg font-semibold text-neutral-800">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm text-neutral-500 mb-2">Address</p>
              <div className="grid grid-cols-2 gap-2 text-neutral-800">
                <div>
                  <span className="text-xs text-neutral-400">Street:</span>
                  <p>{selectedUser.address || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-xs text-neutral-400">City:</span>
                  <p>{selectedUser.city || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-xs text-neutral-400">State:</span>
                  <p>{selectedUser.state || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-xs text-neutral-400">ZIP Code:</span>
                  <p>{selectedUser.zipCode || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {selectedUser.lastDonationDate && (
              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-sm text-neutral-500">Last Donation</p>
                <p className="text-neutral-800">{formatDate(selectedUser.lastDonationDate)}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="secondary" 
                onClick={() => setShowUserModal(false)}
              >
                Close
              </Button>
              {isUserSuspended(selectedUser) ? (
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
