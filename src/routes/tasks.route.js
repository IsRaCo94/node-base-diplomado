import { Router } from 'express';
import taskController from '../controllers/task.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js'; 

const router = Router();

router.post('/', verifyToken, taskController.createTask);

export default router;