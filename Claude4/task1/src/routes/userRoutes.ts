
import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

const router = Router();

router.post('/usuarios', createUser);
router.get('/usuarios', getAllUsers);
router.get('/usuarios/:id', getUserById);
router.patch('/usuarios/:id', updateUser);
router.delete('/usuarios/:id', deleteUser);

export default router;
