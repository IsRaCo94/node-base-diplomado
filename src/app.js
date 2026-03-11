import express from 'express';
import morgan from 'morgan';
import usersRoutes from './routes/users.route.js';
import authRoutes from './routes/auth.route.js';
import tasksRoutes from './routes/tasks.route.js';

// 1. Nuevas importaciones para Swagger
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';

const app = express();

// 2. Cargar el archivo yaml (Asegúrate de que swagger.yaml esté en la carpeta principal de tu proyecto)
const swaggerDocument = yaml.load('./swagger.yaml');

// Middlewares
app.use(morgan('combined'));
app.use(express.json());

// Rutas de tu API
app.use('/api/users', usersRoutes);
app.use('/api/login', authRoutes);
app.use('/api/tasks', tasksRoutes);

// 3. RUTA: Aquí es donde se verá la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 4. NUEVA REDIRECCIÓN: Redirige la ruta principal (/) directo al Swagger
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

export default app;