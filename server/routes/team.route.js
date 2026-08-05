import express from 'express';
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from '../controllers/team.controller.js';
import { isAuthenticatedUser, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', isAuthenticatedUser, isAdmin, getTeamMembers);
router.post('/', isAuthenticatedUser, isAdmin, addTeamMember);
router.put('/:id', isAuthenticatedUser, isAdmin, updateTeamMember);
router.delete('/:id', isAuthenticatedUser, isAdmin, deleteTeamMember);

export default router;
