
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { state } = useAuth();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Sticky navbar */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-lg">diamond</span>
              </div>
              <span className="font-headline font-bold text-lg text-primary">AuraWealth</span>
            </Link>

            {/* Center nav links */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              <NavLink
                to="/cards"
                className={({ isActive }) =>
                  `font-body text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'text-primary bg-primary-fixed/30'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                Find a Card
              </NavLink>
              <NavLink
                to="/simulator"
                className={({ isActive }) =>
                  `font-body text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'text-primary bg-primary-fixed/30'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                Rewards Calculator
              </NavLink>
              <NavLink
                to="/compare"
                className={({ isActive }) =>
                  `font-body text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'text-primary bg-primary-fixed/30'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                Compare Cards
              </NavLink>
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `font-body text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'text-primary bg-primary-fixed/30'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                Blog
              </NavLink>
            </nav>

            {/* Right CTA */}
            <div className="ml-auto flex items-center gap-3">
              {state.isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary text-sm py-2 px-4">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="font-body text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors hidden sm:block"
                  >
                    Sign In
                  </Link>
                  <Link to="/auth" className="btn-primary text-sm py-2 px-4">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-primary-fixed rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-base">diamond</span>
                </div>
                <span className="font-headline font-bold text-base text-inverse-on-surface">
                  AuraWealth
                </span>
              </div>
              <p className="font-body text-sm text-inverse-on-surface/60 max-w-xs">
                India's smartest credit card advisor. Find cards that earn you the most.
              </p>
            </div>
            <div className="flex flex-wrap gap-12">
              <div>
                <p className="font-body font-semibold text-sm text-inverse-on-surface mb-3">
                  Product
                </p>
                <ul className="space-y-2">
                  {[
                    { label: 'Find a Card', to: '/cards' },
                    { label: 'Compare Cards', to: '/compare' },
                    { label: 'Rewards Calculator', to: '/simulator' },
                    { label: 'Get Recommendations', to: '/expense-profiler' },
                  ].map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="font-body text-sm text-inverse-on-surface/60 hover:text-inverse-on-surface transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-body font-semibold text-sm text-inverse-on-surface mb-3">
                  Company
                </p>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/blog"
                      className="font-body text-sm text-inverse-on-surface/60 hover:text-inverse-on-surface transition-colors"
                    >
                      Blog
                    </Link>
                  </li>
                  {['About', 'Privacy Policy', 'Terms of Service', 'Contact'].map((label) => (
                    <li key={label}>
                      <span className="font-body text-sm text-inverse-on-surface/60 cursor-default">
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-inverse-on-surface/20 mt-8 pt-6 text-center">
            <p className="font-body text-xs text-inverse-on-surface/40">
              © {new Date().getFullYear()} AuraWealth. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
