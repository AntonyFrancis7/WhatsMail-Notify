import { useEffect, useState } from "react";
import authService from "../services/authService";
import gmailService from "../services/gmailService";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmailCard from "../components/EmailCard";

export default function Inbox() {
  const [user, setUser] = useState(null);
  const [gmailProfile, setGmailProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [nextPageToken, setNextPageToken] = useState(null);
  const [pageHistory, setPageHistory] = useState([]); // Stack of previous tokens
  const [currentPageToken, setCurrentPageToken] = useState(null);

  // Fetch logged-in user and gmail profile on mount
  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch current user details
        const userRes = await authService.getProfile();
        setUser(userRes.data);

        // Fetch Gmail profile metadata
        try {
          const profileRes = await gmailService.getProfile();
          setGmailProfile(profileRes.data);
        } catch (e) {
          console.error("Gmail profile fetch failed", e);
          setError("Failed to verify Gmail access. Please re-authenticate your Google Account.");
          setLoading(false);
          return;
        }

        // Fetch initial batch of messages
        await loadMessages(activeQuery, null);
      } catch (err) {
        console.error("Failed to load page credentials", err);
        setError("Unauthorized or server connection failure.");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, []);

  // Fetch messages when search query or token changes
  const loadMessages = async (query, token) => {
    try {
      setLoadingMessages(true);
      setError(null);
      const res = await gmailService.getMessages(query, token);
      setMessages(res.data.messages || []);
      setNextPageToken(res.data.nextPageToken);
    } catch (err) {
      console.error("Failed to retrieve messages", err);
      setError(err.response?.data?.message || "Failed to load messages from Gmail API.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Trigger search
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
    setCurrentPageToken(null);
    setPageHistory([]);
    loadMessages(searchQuery, null);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveQuery("");
    setCurrentPageToken(null);
    setPageHistory([]);
    loadMessages("", null);
  };

  // Refresh current view
  const handleRefresh = async () => {
    setLoadingMessages(true);
    try {
      // Reload Gmail profile stats
      const profileRes = await gmailService.getProfile();
      setGmailProfile(profileRes.data);
      
      // Reload messages list
      await loadMessages(activeQuery, currentPageToken);
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Pagination navigation
  const handleNextPage = () => {
    if (!nextPageToken) return;
    const newHistory = [...pageHistory, currentPageToken];
    setPageHistory(newHistory);
    setCurrentPageToken(nextPageToken);
    loadMessages(activeQuery, nextPageToken);
  };

  const handlePrevPage = () => {
    if (pageHistory.length === 0) return;
    const newHistory = [...pageHistory];
    const prevToken = newHistory.pop();
    setPageHistory(newHistory);
    setCurrentPageToken(prevToken);
    loadMessages(activeQuery, prevToken);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      <Navbar user={user} onLogout={() => setUser(null)} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* Top Info & Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-neutral-800 bg-neutral-950/40 backdrop-blur-md shadow-lg">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Gmail Connection Active
            </h1>
            {gmailProfile && (
              <p className="text-sm font-mono text-neutral-400">
                Connected: {gmailProfile.emailAddress} (Approx. {gmailProfile.messagesTotal} emails)
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loadingMessages}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700/80 font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 text-emerald-400 ${loadingMessages ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 text-rose-400 text-sm flex gap-3 items-start">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-1">
              <p className="font-semibold">Inbox Sync Status Error</p>
              <p className="text-xs text-rose-400/80">{error}</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search sender, subject, or query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-neutral-950/40 border border-neutral-800 rounded-xl focus:outline-none focus:border-emerald-500 text-neutral-100 placeholder-neutral-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-900 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Messages List Area */}
        <div className="space-y-4">
          {loadingMessages ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <p className="text-sm text-neutral-400 font-medium">Synchronizing messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/10">
              <svg className="w-12 h-12 mx-auto text-neutral-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <h3 className="text-base font-semibold text-neutral-300">No emails found</h3>
              <p className="text-xs text-neutral-500 mt-1">Try refreshing the connection or modifying your search query.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {messages.map((msg) => (
                <EmailCard key={msg.id} email={msg} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loadingMessages && messages.length > 0 && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-950/20">
            <button
              onClick={handlePrevPage}
              disabled={pageHistory.length === 0}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/50 text-neutral-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="hidden sm:inline">&larr; Previous Page</span>
              <span className="inline sm:hidden">&larr; Prev</span>
            </button>
            <span className="text-xs font-mono text-neutral-500">
              Page {pageHistory.length + 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!nextPageToken}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700/50 text-neutral-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="hidden sm:inline">Next Page &rarr;</span>
              <span className="inline sm:hidden">Next &rarr;</span>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
