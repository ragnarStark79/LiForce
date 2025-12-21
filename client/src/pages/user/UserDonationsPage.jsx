import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { userService } from '../../services/userService';
import { DONATION_ELIGIBILITY_DAYS } from '../../utils/constants';

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
      setTimeout(() => setLoading(false), 500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const lastDonation = donations.length > 0 ? new Date(donations[0].donationDate) : null;
  const nextDate = lastDonation
    ? new Date(lastDonation.getTime() + DONATION_ELIGIBILITY_DAYS * 24 * 60 * 60 * 1000)
    : new Date();
  const isEligible = new Date() >= nextDate;
  const today = new Date();
  const daysUntilEligible = lastDonation
    ? Math.max(0, Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 animate-fade-up">
      {/* Header Hero */}
      <div className="text-center space-y-3 pt-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
          Your Life-Saving Journey
        </h1>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          Every drop counts. Track your impact and continue saving lives.
        </p>
      </div>

      {/* Status & Eligibility Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 animate-fade-up" 
           style={{ animationDelay: '0.2s' }}>
        <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
          <span className="text-xl">📅</span> Next Eligible Donation
        </h3>

        {isEligible ? (
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl text-lg font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <span className="text-2xl">✅</span> Available Now
            </div>
            <p className="text-gray-600 text-sm md:text-base">You are eligible to donate today!</p>
            <a href="/user/schedule-donation"
              className="inline-block mt-3 px-8 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold 
                        hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm md:text-base">
              Schedule Donation Now →
            </a>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <span className="text-2xl">⏰</span>
              <div className="text-left">
                <div className="text-2xl md:text-3xl font-bold text-gray-800">
                  {daysUntilEligible} {daysUntilEligible === 1 ? 'Day' : 'Days'}
                </div>
                <div className="text-xs md:text-sm text-gray-600">until eligible</div>
              </div>
            </div>
            <div className="text-base md:text-lg font-semibold text-gray-700 mt-4">
              {nextDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <p className="text-gray-500 text-sm">Keep resting! Your body needs time to recover.</p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-linear-to-r from-rose-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((DONATION_ELIGIBILITY_DAYS - daysUntilEligible) / DONATION_ELIGIBILITY_DAYS) * 100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Recovery Progress</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid - Compact & Animated */}
      <div className="grid grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        {[
          { label: 'Donations', value: stats.total, color: 'from-rose-400 to-pink-500', bgColor: 'bg-rose-50', icon: '🩸', delay: '0.4s' },
          { label: 'Volume', value: `${stats.units}ml`, color: 'from-blue-400 to-indigo-500', bgColor: 'bg-blue-50', icon: '💧', delay: '0.45s' },
          { label: 'Lives Saved', value: stats.lives, color: 'from-emerald-400 to-green-500', bgColor: 'bg-emerald-50', icon: '❤️', delay: '0.5s' },
        ].map((stat) => (
          <div 
            key={stat.label} 
            className={`${stat.bgColor} rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-up`}
            style={{ animationDelay: stat.delay }}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl md:text-2xl mb-3 shadow-sm transform transition-transform duration-300 hover:scale-110`}>
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-xs font-medium uppercase tracking-wide">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Donation History */}
      <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.55s' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-sm">
              📜
            </span>
            Donation History
          </h2>
          {donations.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              {donations.length} {donations.length === 1 ? 'Donation' : 'Donations'}
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {donations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center px-4 animate-fade-up" 
                 style={{ animationDelay: '0.6s' }}>
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-4xl md:text-5xl mb-6 shadow-sm animate-bounce-slow">
                📭
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-2">No donations yet</h3>
              <p className="text-gray-500 max-w-md text-sm md:text-base mb-6">
                Schedule your first donation to begin your life-saving journey!
              </p>
              <a href="/user/schedule-donation" 
                className="px-6 py-3 bg-linear-to-r from-rose-600 to-pink-600 text-white text-sm md:text-base font-semibold rounded-xl 
                          hover:from-rose-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 inline-flex items-center gap-2">
                <span>🩸</span> Start your journey
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {donations.map((donation, index) => (
                <div 
                  key={donation._id || index}
                  className="p-5 hover:bg-gray-50 transition-all duration-300 animate-fade-up group"
                  style={{ animationDelay: `${0.6 + index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {donation.bloodGroup || '🩸'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-gray-900 text-base">
                              {donation.centerId?.name || 'Donation Center'}
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-300
                                            ${donation.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                donation.status === 'PENDING' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 
                                  'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                              {donation.status}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="text-gray-400">📅</span>
                            {new Date(donation.donationDate).toLocaleDateString(undefined, { 
                              weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                          <span className="text-base">⚖️</span> 
                          <span className="font-medium">{donation.unitsDonated || 1} Unit{donation.unitsDonated > 1 ? 's' : ''}</span>
                        </span>
                        {donation.status === 'COMPLETED' && (
                          <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                            <span className="text-base">❤️</span> 
                            <span className="font-medium">{(donation.unitsDonated || 1) * 3} Lives Saved</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Motivational Footer */}
      {donations.length > 0 && (
        <div className="bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 text-center border border-gray-200 animate-fade-up" 
             style={{ animationDelay: '0.7s' }}>
          <p className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
            🎉 Thank you for being a hero!
          </p>
          <p className="text-sm md:text-base text-gray-600">
            Your {stats.total} donation{stats.total !== 1 ? 's' : ''} have potentially saved {stats.lives} {stats.lives === 1 ? 'life' : 'lives'}.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserDonationsPage;