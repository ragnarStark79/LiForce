import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary-600 mb-2">
            LifeForce
          </h1>
          <p className="text-neutral-600">Blood Donation Platform</p>
        </div>
        
        <div className="bg-white rounded-softer shadow-soft-xl p-8">
          <Outlet />
        </div>
        
        <p className="text-center text-sm text-neutral-500 mt-6">
          © 2024 LifeForce. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
