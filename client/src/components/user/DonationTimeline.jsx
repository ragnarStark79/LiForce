const DonationTimeline = ({ donations }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p>No donations yet. Schedule your first donation today!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200" />
      
      <div className="space-y-6">
        {donations.map((donation, index) => (
          <div key={donation._id || index} className="relative pl-10">
            <div className="absolute left-2 w-5 h-5 bg-red-500 rounded-full border-4 border-white shadow" />
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-neutral-800">
                  {formatDate(donation.donationDate)}
                </span>
                <span className="text-lg font-bold text-red-600">
                  {donation.bloodGroup}
                </span>
              </div>
              
              <div className="text-sm text-neutral-600 space-y-1">
                <p><span className="font-medium">Units:</span> {donation.unitsDonated}</p>
                <p><span className="font-medium">Hospital:</span> {donation.hospitalId?.name || 'N/A'}</p>
                {donation.notes && (
                  <p><span className="font-medium">Notes:</span> {donation.notes}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonationTimeline;