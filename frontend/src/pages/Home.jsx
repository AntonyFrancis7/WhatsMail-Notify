import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Never miss critical emails.{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Get WhatsApp Alerts Instantly.
          </span>
        </h1>
        <p className="text-lg text-neutral-400 sm:text-xl max-w-2xl mx-auto">
          WhatsMail-Notify connects your Gmail inbox directly to WhatsApp. Select specific senders and receive notifications on WhatsApp as soon as their messages land.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold text-neutral-900 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/settings"
            className="px-6 py-3 rounded-lg border border-neutral-700 bg-neutral-800/40 hover:bg-neutral-800 hover:border-neutral-600 font-semibold transition-all"
          >
            Configure Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
