import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-primary-600 mb-6 animate-fade-in">
              Welcome to LifeForce
            </h1>
            <p className="text-xl text-neutral-600 mb-8 animate-slide-up">
              Connecting blood donors with those in need. Save lives through seamless communication and efficient blood donation management.
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-slide-up">
              <Link to="/register">
                <Button size="lg" className="px-8">
                  Become a Donor
                </Button>
              </Link>
              <Link to="/register-staff">
                <Button variant="outline" size="lg" className="px-8">
                  Join as Staff
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="px-8">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-display font-bold text-center text-neutral-800 mb-12">
            Why Choose LifeForce?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card hover className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🩸</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">Easy Blood Requests</h3>
              <p className="text-neutral-600">
                Request blood quickly and efficiently. Connect with nearby donors and hospitals instantly.
              </p>
            </Card>

            <Card hover className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">Real-Time Communication</h3>
              <p className="text-neutral-600">
                Chat directly with hospital staff and donors. Get updates in real-time.
              </p>
            </Card>

            <Card hover className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">Inventory Management</h3>
              <p className="text-neutral-600">
                Hospitals can manage blood inventory efficiently with automated alerts.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of donors and healthcare professionals on LifeForce.
          </p>
          <Link to="/register">
            <Button variant="white" size="lg" className="px-8">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neutral-400">
            © 2024 LifeForce. All rights reserved. | Saving lives, one donation at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
