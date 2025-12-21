import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen v2-bg overflow-x-hidden">
      <div className="v2-container min-h-screen px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brand / marketing panel */}
            <div className="hidden lg:block v2-panel p-10 relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(239,68,68,0.25), transparent 60%)' }}
                />
                <div className="absolute -bottom-24 -left-24 w-[520px] h-[520px] rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.20), transparent 60%)' }}
                />
              </div>

              <div className="relative">
                <div className="inline-flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/70 border border-slate-200/70 flex items-center justify-center shadow-sm">
                    <span className="text-xl font-extrabold text-slate-900">LF</span>
                  </div>
                  <div>
                    <div className="text-slate-900 font-extrabold tracking-tight" style={{ fontSize: '1.5rem' }}>LifeForce</div>
                    <div className="text-slate-600 text-sm font-medium">Blood Donation Platform</div>
                  </div>
                </div>

                <h2 className="mt-10 text-slate-950 font-black tracking-tight" style={{ fontSize: '2.25rem', lineHeight: 1.05 }}>
                  Premium donor portal
                  <span className="block text-slate-600" style={{ fontSize: '1.25rem', fontWeight: 650, marginTop: '0.75rem' }}>
                    faster flows, clearer status, real-time updates
                  </span>
                </h2>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[{ k: 'Secure auth', v: 'Token-based sessions' }, { k: 'Realtime', v: 'Chat + notifications' }, { k: 'Smart status', v: 'Eligibility insights' }, { k: 'Privacy', v: 'Scoped role access' }].map((i) => (
                    <div key={i.k} className="rounded-2xl bg-white/60 border border-slate-200/60 px-4 py-4 shadow-sm">
                      <div className="text-slate-900 font-semibold">{i.k}</div>
                      <div className="text-slate-600 text-sm mt-1">{i.v}</div>
                    </div>
                  ))}
                </div>

                <p className="mt-8 text-slate-600 text-sm leading-relaxed">
                  This interface is optimised for clarity and speed so you can donate, request blood, and manage your profile with confidence.
                </p>
              </div>
            </div>

            {/* Auth form panel */}
            <div className="v2-panel p-6 sm:p-8 lg:p-10">
              <Outlet />
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 mt-8">
            © 2024 LifeForce. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
