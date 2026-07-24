import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center space-y-6">
      <h1 className="text-6xl font-extrabold text-neutral-800">404</h1>
      <p className="text-xl text-neutral-400">Page not found</p>
      <Link to="/" className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 transition font-semibold text-neutral-200">
        Go Back Home
      </Link>
    </div>
  );
}
