import { db, findByQuery, findById, updateById, deleteById, create } from '../config/db.js';
import bcrypt from 'bcryptjs';

const COLLECTION = 'users';

// Fetch all team members (Admins & Managers)
export const getTeamMembers = async (req, res) => {
    try {
        const usersSnapshot = await db.ref(COLLECTION).once('value');
        const users = usersSnapshot.val() || {};
        
        const team = [];
        for (const [key, user] of Object.entries(users)) {
            if (user.role && ['ADMIN', 'Super Admin', 'Manager'].includes(user.role)) {
                team.push({
                    id: key,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                });
            }
        }

        return res.status(200).json({ success: true, data: team });
    } catch (error) {
        console.error('Error fetching team members:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add new team member
export const addTeamMember = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (req.user.role !== 'Super Admin' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only Super Admins can add team members' });
        }

        const lowerEmail = email.toLowerCase();
        const existing = await findByQuery(COLLECTION, 'email', lowerEmail);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = {
            name,
            email: lowerEmail,
            password: hashedPassword,
            role: role || 'Manager',
            isVerified: true,
            status: 'Active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const created = await create(COLLECTION, newAdmin);
        
        return res.status(201).json({ success: true, message: 'Team member added successfully', data: { id: created._id || created.id, name, email, role } });
    } catch (error) {
        console.error('Error adding team member:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update team member role
export const updateTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (req.user.role !== 'Super Admin' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only Super Admins can update roles' });
        }

        const user = await findById(COLLECTION, id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await updateById(COLLECTION, id, { role, updatedAt: new Date().toISOString() });
        return res.status(200).json({ success: true, message: 'Team member updated successfully' });
    } catch (error) {
        console.error('Error updating team member:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete team member
export const deleteTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.user.role !== 'Super Admin' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Only Super Admins can delete team members' });
        }

        if (id === req.userId) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }

        const user = await findById(COLLECTION, id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await deleteById(COLLECTION, id);
        return res.status(200).json({ success: true, message: 'Team member removed successfully' });
    } catch (error) {
        console.error('Error deleting team member:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
