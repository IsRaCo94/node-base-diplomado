import { Router } from 'express';
import userController from '../controllers/user.controller.js';
const router = Router();


router.route('/list/pagination').get(userController.getUsersPaginated);


router.route('/')
  .get(userController.getPrueba)
  .post(userController.createUser);


router.route('/:id/tasks').get(userController.getUserWithTasks);

export default router;