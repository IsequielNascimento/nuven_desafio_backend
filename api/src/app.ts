// src/app.ts
import express from 'express';
// 1. Importe as ferramentas necessárias
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import publicRoutes from './routes/public.js';
import privateRoutes from './routes/private.js';
import auth from './middlewares/auth.js';
import datasetRoutes from './routes/dataset.js';
import { setupSwagger } from './config/swagger.js';

// 2. Recrie o __dirname para o ambiente ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// Agora esta linha funcionará corretamente
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

setupSwagger(app);

app.use(publicRoutes);
app.use(auth, privateRoutes);
app.use(datasetRoutes);

export default app;