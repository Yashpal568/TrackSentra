import { Link, Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from './ui/Button';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-blue-500" />
            TrackSentra
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/features" className="hover:text-blue-400 font-medium transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-blue-400 font-medium transition-colors">Pricing</Link>
            <Link to="/faq" className="hover:text-blue-400 font-medium transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-blue-400 font-medium transition-colors">Contact</Link>
            <Link to="/login" className="hover:text-white text-slate-300 font-medium ml-4">Login</Link>
            <Link to="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
          <div>
            <Link to="/" className="text-xl font-bold flex items-center gap-2 text-white mb-4">
              <Shield className="text-blue-500" />
              TrackSentra
            </Link>
            <p className="text-sm">Industrial Security Patrol Management SaaS.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="hover:text-white">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@tracksentra.com" className="hover:text-white">support@tracksentra.com</a></li>
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm max-w-6xl mx-auto">
          &copy; {new Date().getFullYear()} TrackSentra. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
