import { useEffect, useState } from "react";
import authService from "../services/authService";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getProfile();
        setUser(res.data);
      } catch (error) {
        console.error("Failed to load user profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-950/40 backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-center gap-6">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full border-2 border-emerald-500 shadow-md" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center text-emerald-500 text-2xl font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
          )}
          
          <div className="text-center sm:text-left space-y-1 flex-1">
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-sm font-mono text-neutral-400">{user?.email}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 mt-2">
              Google Account Connected
            </div>
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-950/40 backdrop-blur-md space-y-4">
          <h2 className="text-xl font-bold">Integrations Status</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-900/40">
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Gmail Alert Scanner</p>
              <p className="text-lg font-bold text-yellow-400/90 mt-1">Pending Setup (Sprint 3)</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-900/40">
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">WhatsApp Alerts</p>
              <p className="text-lg font-bold text-yellow-400/90 mt-1">Pending Setup (Sprint 3)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
