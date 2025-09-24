import React from 'react'
import { supabase } from "../lib/supabase.js";
import toast from "react-hot-toast";

const HomePage = () => {
    const handlelogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) toast.error(error.message);
        else toast.success("Logout successful!");
    };
  return (
    <>

    <div>HomePage</div>
    <div>
        <button onClick={handlelogout}>Logout</button>
    </div>
    </>
  )
}

export default HomePage