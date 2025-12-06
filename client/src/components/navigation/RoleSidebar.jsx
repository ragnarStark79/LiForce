import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import { ROLES } from '../../utils/constants';

const RoleSidebar = ({ isOpen, isMobile, onClose }) => {
  const { user } = useAuth();

  const userMenuItems = [
    { path: '/user/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/user/profile', label: 'Profile', icon: '👤' },
    { path: '/user/blood-requests', label: 'My Requests', icon: '🩸' },
    { path: '/user/donations', label: 'Donations', icon: '💝' },
    { path: '/user/schedule-donation', label: 'Schedule Donation', icon: '📅' },
    { path: '/user/chat', label: 'Messages', icon: '💬' },
    { path: '/user/settings', label: 'Settings', icon: '⚙️' },
  ];

  const staffMenuItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/staff/profile', label: 'My Profile', icon: '👤' },
    { path: '/staff/blood-requests', label: 'Blood Requests', icon: '🩸' },
    { path: '/staff/patients', label: 'Patients', icon: '🏥' },
    { path: '/staff/inventory', label: 'Inventory', icon: '📦' },
    { path: '/staff/donation-schedules', label: 'Donation Schedules', icon: '📅' },
    { path: '/staff/chat', label: 'Messages', icon: '💬' },
  ];

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/admin/staff-approvals', label: 'Staff Approvals', icon: '✅' },
    { path: '/admin/users', label: 'Users', icon: '👨‍👩‍👧‍👦' },
    { path: '/admin/hospitals', label: 'Hospitals', icon: '🏥' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📊' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case ROLES.ADMIN:
        return adminMenuItems;
      case ROLES.STAFF:
        return staffMenuItems;
      case ROLES.USER:
      default:
        return userMenuItems;
    }
  };

  return (
    <Sidebar 
      items={getMenuItems()} 
      isOpen={isOpen} 
      isMobile={isMobile}
      onClose={onClose}
    />
  );
};

export default RoleSidebar;
