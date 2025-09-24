import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { supabase } from "./lib/supabase.js";
import { toast } from "react-hot-toast";

import Home from "./pages/HomePage";
import SignUp from "./pages/SignUpPage";
import SignIn from "./pages/SignInPage";
import UploadPage from "./pages/UploadPage";
import LandingPage from "./pages/LandingPage.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
      } else {
        setUser(data.user);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else toast.success("Signed out!");
  };

  return (
    <Router>
      <div className="p-4 flex justify-between items-center bg-gray-100">
        <Link to="/" className="text-lg font-bold">
          eDNA Project
        </Link>
        <div>
          {user ? (
            <>
              <span className="mr-4">Hello, {user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      <Routes>   
        <Route path="/" element={<LandingPage />} />

        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
}
