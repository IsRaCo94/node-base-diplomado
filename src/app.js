import express from 'express';
import morgan from 'morgan';
import usersRoutes from './routes/users.route.js';
import authRoutes from './routes/auth.route.js';
import tasksRoutes from './routes/tasks.route.js'; 

const app = express();

app.use(morgan('combined'));
app.use(express.json());

app.use('/api/users', usersRoutes);
app.use('/api/login', authRoutes);
app.use('/api/tasks', tasksRoutes); 
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'online',
        message: 'API del Diplomado funcionando correctamente',
        docs: '/api/users, /api/login, /api/tasks'
    });
});
export default app;