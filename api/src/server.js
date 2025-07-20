import express from 'express';
import publicRoutes from './routes/public.js';
import privateRoutes from './routes/private.js';
import auth from './middlewares/auth.js';
import datasetRoutes from './routes/dataset.js';
import { setupSwagger } from './config/swagger.js';


const app = express()
app.use(express.json())

setupSwagger(app)

app.use('/user',publicRoutes)
app.use('/', auth, privateRoutes)
app.use('/', datasetRoutes)


app.listen(3000, ()=> console.log("Servidor Iniciado 💾"))
