const { pool } = require('../database/pool');
const { safeQuery } = require('../utils/databaseUtils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT id, username, role, createdAt, updatedAt FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT id, username, role, createdAt, updatedAt FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

// Create new user (admin only)
const createUser = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (!role || !['admin', 'editor', 'viewer', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Valid role is required (admin, editor, viewer, user)' });
    }

    try {
        // Check if username already exists
        const existingUser = await safeQuery('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await safeQuery(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        // Get the newly created user
        const rows = await safeQuery(
            'SELECT id, username, role, createdAt, updatedAt FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
};

// Update user (admin only)
const updateUser = async (req, res) => {
    const { username, password, role } = req.body;
    const userId = req.params.id;

    if (!role || !['admin', 'editor', 'viewer', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Valid role is required (admin, editor, viewer, user)' });
    }

    try {
        // Check if user exists
        const existingUser = await safeQuery('SELECT id FROM users WHERE id = ?', [userId]);
        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if username is taken by another user
        if (username) {
            const usernameCheck = await safeQuery('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
            if (usernameCheck.length > 0) {
                return res.status(409).json({ error: 'Username already exists' });
            }
        }

        let query = 'UPDATE users SET role = ?, updatedAt = CURRENT_DATE';
        let params = [role];

        if (username) {
            query = 'UPDATE users SET username = ?, role = ?, updatedAt = CURRENT_DATE';
            params = [username, role];
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = username ?
                'UPDATE users SET username = ?, password = ?, role = ?, updatedAt = CURRENT_DATE' :
                'UPDATE users SET password = ?, role = ?, updatedAt = CURRENT_DATE';
            params = username ? [username, hashedPassword, role] : [hashedPassword, role];
        }

        query += ' WHERE id = ?';
        params.push(userId);

        await safeQuery(query, params);

        // Get updated user
        const rows = await safeQuery(
            'SELECT id, username, role, createdAt, updatedAt FROM users WHERE id = ?',
            [userId]
        );

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const result = await safeQuery('DELETE FROM users WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const rows = await safeQuery('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
    try {
        const rows = await safeQuery('SELECT id, username, role, createdAt, updatedAt FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Error fetching current user' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    getCurrentUser
};