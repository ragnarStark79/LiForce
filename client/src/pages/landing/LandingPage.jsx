import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: '10,000+', label: 'Lives Saved', icon: '❤️' },
    { value: '5,000+', label: 'Active Donors', icon: '🩸' },
    { value: '150+', label: 'Partner Hospitals', icon: '🏥' },
    { value: '24/7', label: 'Support Available', icon: '⏰' },
  ];

  const features = [
    {
      icon: '🩸',
      title: 'Smart Blood Matching',
      description: 'AI-powered matching system connects patients with compatible donors instantly.',
      gradient: 'from-red-500 to-rose-600',
    },
    {
      icon: '💬',
      title: 'Real-Time Communication',
      description: 'Secure messaging between donors, hospitals, and patients for seamless coordination.',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: '📊',
      title: 'Inventory Analytics',
      description: 'Advanced tracking and predictive analytics for blood inventory management.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: '📅',
      title: 'Easy Scheduling',
      description: 'Book donation appointments with just a few clicks at your preferred hospital.',
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      icon: '🔔',
      title: 'Smart Notifications',
      description: 'Get instant alerts for urgent blood requests and donation reminders.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: '🛡️',
      title: 'Verified & Secure',
      description: 'All donors and hospitals are verified for safety and reliability.',
      gradient: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-rose-500 to-pink-600">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-rose-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8 border border-white/30">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Saving lives since 2020
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Every Drop
              <span className="block bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
                Counts
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join the revolution in blood donation. Connect with hospitals, save lives,
              and be part of something bigger than yourself.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-16">
              {!isAuthenticated && (
                <>
                  <Link to="/register">
                    <button className="group px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl shadow-2xl 
                                       hover:shadow-white/25 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1
                                       flex items-center gap-3">
                      <span>Become a Donor</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </Link>
                  <Link to="/register-staff">
                    <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl 
                                       border-2 border-white/30 hover:bg-white/20 transform transition-all duration-300 
                                       hover:scale-105 hover:-translate-y-1">
                      Join as Staff
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="px-8 py-4 text-white font-semibold hover:text-white/80 transition-colors
                                       flex items-center gap-2">
                      <span>Already a member?</span>
                      <span className="underline">Sign In</span>
                    </button>
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link to="/user/dashboard">
                  <button className="group px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl shadow-2xl 
                                     hover:shadow-white/25 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1
                                     flex items-center gap-3">
                    <span>Go to Dashboard</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20
                             transform transition-all duration-500 hover:scale-105 hover:bg-white/20
                             ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100 + 500}ms` }}
                >
                  <span className="text-3xl mb-2 block">{stat.icon}</span>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/70 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-600/5 to-transparent" />

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
              FEATURES
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-primary-600">LifeForce</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built the most advanced blood donation platform to make saving lives easier than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl 
                          transform transition-all duration-500 hover:-translate-y-2 border border-gray-100
                          overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 
                                group-hover:opacity-5 transition-opacity duration-500`} />

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} 
                                flex items-center justify-center text-3xl mb-6 shadow-lg
                                group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center text-primary-600 font-semibold opacity-0 
                               group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 
                               transition-all duration-300">
                  <span>Learn more</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-white/10 text-white rounded-full text-sm font-semibold mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Three Simple Steps
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Getting started with LifeForce is quick and easy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Register', desc: 'Create your account and complete your profile with blood type and health info.' },
              { step: '02', title: 'Connect', desc: 'Find nearby hospitals and schedule your donation at a convenient time.' },
              { step: '03', title: 'Donate', desc: 'Visit the hospital, donate blood, and help save up to 3 lives!' },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10
                               hover:bg-white/15 transition-all duration-300 group">
                  <div className="text-6xl font-bold text-white/20 mb-4 group-hover:text-primary-400 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/70">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-white/30 text-4xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 via-rose-500 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of heroes who have already made a difference. Your donation could save up to 3 lives.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <button className="px-10 py-5 bg-white text-primary-600 font-bold text-lg rounded-2xl shadow-2xl
                                    hover:shadow-white/25 transform transition-all duration-300 hover:scale-105">
                    Get Started Now
                  </button>
                </Link>
                <Link to="/login">
                  <button className="px-10 py-5 bg-transparent text-white font-bold text-lg rounded-2xl 
                                    border-2 border-white/50 hover:bg-white/10 transition-all duration-300">
                    Sign In
                  </button>
                </Link>
              </>
            ) : (
              <Link to="/user/dashboard">
                <button className="px-10 py-5 bg-white text-primary-600 font-bold text-lg rounded-2xl shadow-2xl
                                    hover:shadow-white/25 transform transition-all duration-300 hover:scale-105">
                  Go to Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-rose-500 rounded-xl 
                               flex items-center justify-center text-2xl font-bold">
                  L
                </div>
                <span className="text-2xl font-bold">LifeForce</span>
              </div>
              <p className="text-gray-400">
                Connecting blood donors with those in need. Every drop counts.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Become a Donor</Link></li>
                <li><Link to="/register-staff" className="hover:text-white transition-colors">Join as Staff</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Blood Donation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect With Us</h4>
              <div className="flex gap-4">
                {['📘', '🐦', '📷', '💼'].map((icon, i) => (
                  <button key={i} className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center
                                            hover:bg-white/20 transition-colors">
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>© 2024 LifeForce. All rights reserved. | Saving lives, one donation at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
