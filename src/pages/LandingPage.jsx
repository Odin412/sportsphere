import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      {/* Logo + brand */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f6f4f4e61dd2806b88ed2/15137601c_392DC896-FFC0-4491-BCB6-20C0C160BF03.png"
          alt="Sportsphere"
          className="w-12 h-12 object-contain"
        />
        <span className="text-3xl font-black tracking-tight">Sportsphere</span>
      </div>

      {/* Tagline */}
      <h1 className="text-4xl sm:text-5xl font-black text-center mb-4 leading-tight">
        Your Sports Life,{" "}
        <span className="text-red-500">All in One Place</span>
      </h1>
      <p className="text-gray-400 text-lg text-center max-w-md mb-10">
        Live streams, athlete profiles, training tools, and a community built for sports.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/login"
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl text-base transition-colors text-center"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-3 rounded-xl text-base transition-colors text-center"
        >
          Sign In
        </Link>
      </div>

      {/* Footer */}
      <p className="text-gray-600 text-sm mt-16">&copy; 2026 Sportsphere. All rights reserved.</p>
    </div>
  );
}
