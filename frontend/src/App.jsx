import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { supabase } from "./lib/supabase.js";
import { toast } from "react-hot-toast";

import Home from "./pages/HomePage";
import SignUp from "./pages/SignUpPage";
import SignIn from "./pages/SigninPage";
import UploadPage from "./pages/UploadPage";
import LandingPage from "./pages/LandingPage.jsx";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  

  

  return (
    <Router>
      
      

      <Routes>   
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadPage />} />

        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
}
