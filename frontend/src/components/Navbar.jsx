import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { toast } from "react-hot-toast";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else {
      toast.success("Signed out!");
      setUser(null);
      navigate("/");
    }
  };

  return (
    <nav className="bg-[#f0f4ff] backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🧬</span>
            <span className="font-bold text-blue-900 text-xl tracking-wide">
                BioTrace
            </span>
          </Link>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-blue-800 hidden sm:block">
                  Hello, {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
