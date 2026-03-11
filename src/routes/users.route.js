import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/list/pagination').get(userController.getUsersPaginated);

router.route('/')
  .get(userController.getUsers)
  .post(userController.createUser);

router.route('/:id/tasks').get(userController.getUserWithTasks);

// Rutas protegidas por ID
router.route('/:id')
  .get(verifyToken, userController.getUserById)
  .put(verifyToken, userController.updateUser)
  .patch(verifyToken, userController.patchUser)
  .delete(verifyToken, userController.deleteUser);

export default router;