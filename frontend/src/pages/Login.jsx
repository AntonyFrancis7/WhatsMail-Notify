import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-md p-8 rounded-2xl border border-neutral-800 bg-neutral-950/40 backdrop-blur-md shadow-xl text-center space-y-8">
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-neutral-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              MailPulse
            </h1>
            <p className="text-sm text-neutral-400 mt-1">Real-Time Gmail to WhatsApp Notifications</p>
          </div>
        </div>

        <div className="border-t border-neutral-900 pt-6">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}
