import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      if (onLogout) onLogout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center sm:gap-6 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              MailPulse
            </span>
          </div>
          {user && (
            <div className="flex items-center sm:gap-4 gap-2.5 border-l border-neutral-800 sm:pl-6 pl-3">
              <Link to="/dashboard" className="text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white transition">
                Dashboard
              </Link>
              <Link to="/inbox" className="text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white transition">
                Inbox
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-neutral-700" />
              <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
