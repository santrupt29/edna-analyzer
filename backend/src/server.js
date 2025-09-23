import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import { PORT } from './config/env.js';
import multer from 'multer';
import { supabase } from './config/supabase.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({storage: multer.memoryStorage()});

app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
