import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// POST /auth/signup { email, password }
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ user: data.user });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ session: data.session, user: data.user });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/logout { access_token }
router.post('/logout', async (req, res) => {
  try {
    const { access_token: accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'access_token required' });

    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
