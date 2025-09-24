import React, { useState } from "react";
import { supabase } from "../lib/supabase.js";
import toast from "react-hot-toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) toast.error(error.message);
    else toast.success("Signup successful! Check your email.");
  };

  const handleGoogleSignup = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin, },
    });

    if (error) toast.error(error.message);
    else {
      toast.success("Redirecting to Google...");
      window.location.href = data.url;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-6">Signup</h2>

      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-3 w-80 bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        <input
          type="email"
          placeholder="Email"
          className="p-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="p-2 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white font-semibold"
        >
          Signup
        </button>
      </form>

      <button
        onClick={handleGoogleSignup}
        className="mt-4 bg-red-600 hover:bg-red-700 p-2 px-4 rounded font-semibold"
      >
        Signup with Google
      </button>
    </div>
  );
}
