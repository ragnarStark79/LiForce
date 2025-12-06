import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const FeedbackForm = ({ onSubmit, requestId }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    feedback: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit?.({ ...formData, requestId });
      setFormData({ rating: 5, feedback: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Share Your Feedback</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className={`text-2xl transition-transform hover:scale-110 ${
                  star <= formData.rating ? 'text-yellow-400' : 'text-neutral-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Your Feedback
          </label>
          <textarea
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
            placeholder="Tell us about your experience..."
          />
        </div>

        <Button type="submit" variant="primary" loading={loading} fullWidth>
          Submit Feedback
        </Button>
      </form>
    </Card>
  );
};

export default FeedbackForm;