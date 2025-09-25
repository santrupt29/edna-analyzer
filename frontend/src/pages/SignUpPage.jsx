import React, { useState } from "react";
import { supabase } from "../lib/supabase.js";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) toast.error(error.message);
    else {
      toast.success("Signup successful! Check your email.");
      navigate("/upload");
    }
  };

  const handleGoogleSignup = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/upload` },
    });

    if (error) toast.error(error.message);
    else {
      toast.success("Redirecting to Google...");
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-10 w-96 flex flex-col items-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-indigo-600 mb-6">Sign-up</h2>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSignup}>
          <motion.input
            type="email"
            placeholder="Email"
            className="p-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 text-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            whileFocus={{ scale: 1.02 }}
          />
          <motion.input
            type="password"
            placeholder="Password"
            className="p-3 rounded-xl border border-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 text-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            whileFocus={{ scale: 1.02 }}
          />

          <motion.button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-lg font-semibold transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignup}
          >
            Sign-up
          </motion.button>
        </form>

        <motion.button
          onClick={handleGoogleSignup}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl shadow font-semibold transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign-up with Google
        </motion.button>

        <p className="mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/signin" className="text-indigo-600 font-semibold hover:underline">
            Signin
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
