import { Outlet, Link } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100 font-sans">
      <header className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              WhatsMail-Notify
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/settings" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-950/20 py-6 text-center text-xs text-neutral-500">
        <p>&copy; {new Date().getFullYear()} WhatsMail-Notify. All rights reserved.</p>
      </footer>
    </div>
  );
}
