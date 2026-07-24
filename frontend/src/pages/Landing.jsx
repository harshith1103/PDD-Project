import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <span>🌾</span>
              <span>Bridging the gap between surplus and need</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="gradient-text">Annadaan</span>{' '}
              <span className="text-gray-900">Connect</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              A smart food redistribution platform that connects surplus food donors with 
              those in need — reducing waste, fighting hunger, and building community impact.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all text-lg"
                id="hero-donate-btn"
              >
                🍲 Donate Food
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-secondary-600 hover:bg-secondary-700 text-white font-semibold rounded-xl shadow-lg shadow-secondary-600/25 hover:shadow-secondary-600/40 transition-all text-lg"
                id="hero-volunteer-btn"
              >
                🤝 Volunteer Now
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </section>


      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to make a difference in your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📦',
                title: 'Automated Matching',
                description:
                  'Our smart algorithm matches surplus food with the nearest volunteers and recipients, minimizing waste and delivery time.',
                color: 'from-primary-500 to-orange-400',
              },
              {
                icon: '📍',
                title: 'Real-Time Tracking',
                description:
                  'Track every donation from pickup to delivery. Donors, volunteers, and recipients stay informed at every step.',
                color: 'from-blue-500 to-cyan-400',
              },
              {
                icon: '📊',
                title: 'Impact Analytics',
                description:
                  'See the real impact of your contributions with detailed analytics — meals delivered, food saved, and community reach.',
                color: 'from-secondary-500 to-emerald-400',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 card-hover"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-6 shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Join as</h2>
            <p className="text-lg text-gray-400">Choose your role and start making an impact today</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: 'Donor',
                icon: '🍲',
                description: 'Restaurants, events, households — share your surplus food easily.',
                features: ['Quick donation form', 'Track your impact', 'Get notified on delivery'],
              },
              {
                role: 'Volunteer',
                icon: '🚴',
                description: 'Pick up and deliver food donations to those who need it most.',
                features: ['Accept nearby tasks', 'Real-time updates', 'Build your profile'],
              },
              {
                role: 'Recipient',
                icon: '🏠',
                description: 'Shelters, orphanages, and community kitchens receive fresh food.',
                features: ['Incoming donations view', 'Confirm receipt', 'Track history'],
              },
            ].map((item) => (
              <div
                key={item.role}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{item.role}</h3>
                <p className="text-gray-400 mb-6">{item.description}</p>
                <ul className="space-y-2">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-secondary-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/register"
              className="inline-flex px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg transition-all text-lg"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🍲</span>
            <span className="text-xl font-bold gradient-text">Annadaan Connect</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 Annadaan Connect. Reducing food waste, one meal at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
