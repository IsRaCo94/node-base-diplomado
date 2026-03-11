import { Router } from 'express';
import taskController from '../controllers/task.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Protegemos TODAS las rutas de tareas
router.use(verifyToken);

router.route('/')
  .get(taskController.getTasks)
  .post(taskController.createTask);

router.route('/:id')
  .get(taskController.getTaskById)
  .put(taskController.updateTask)
  .patch(taskController.patchTask)
  .delete(taskController.deleteTask);

export default router;