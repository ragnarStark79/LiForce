import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DonationTimeline from '../../components/user/DonationTimeline';
import { userService } from '../../services/userService';

const UserDonationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ total: 0, units: 0, lives: 0 });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await userService.getDonationHistory();
      setDonations(data.donations || []);
      const total = data.donations?.length || 0;
      const units = data.donations?.reduce((sum, d) => sum + (d.unitsDonated || 1), 0) || 0;
      setStats({ total, units, lives: total * 3 });
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">My Donation History</h1>
        <p className="text-neutral-600 mt-2">Track your donation journey and impact</p>
      </div>

      <Card className="bg-gradient-to-br from-red-50 to-pink-50">
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Next Eligible Donation Date</h3>
        <p className="text-2xl font-bold text-red-600">Available Now!</p>
        <p className="text-sm text-neutral-600 mt-2">You can donate blood today.</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">{stats.total}</div>
          <p className="text-neutral-600 mt-2">Total Donations</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.units}</div>
          <p className="text-neutral-600 mt-2">Units Donated</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.lives}</div>
          <p className="text-neutral-600 mt-2">Lives Saved</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Donation Timeline</h3>
        <DonationTimeline donations={donations} />
      </Card>
    </div>
  );
};

export default UserDonationsPage;