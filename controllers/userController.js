const { safeQuery } = require('../utils/databaseUtils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    normalizePermissions,
    roleFromPermissions,
    toPublicUser
} = require('../utils/userPermissions');

const USER_COLUMNS = 'id, username, role, permissions, createdAt, updatedAt';

const getAllUsers = async (req, res) => {
    try {
        const rows = await safeQuery(`SELECT ${USER_COLUMNS} FROM users`);
        res.json(rows.map(toPublicUser));
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

const getUserById = async (req, res) => {
    try {
        const rows = await safeQuery(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(toPublicUser(rows[0]));
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

const createUser = async (req, res) => {
    const { username, password, role, permissions } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const normalizedPermissions = normalizePermissions(permissions, role || 'user');
    const derivedRole = roleFromPermissions(normalizedPermissions);

    try {
        const existingUser = await safeQuery('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await safeQuery(
            'INSERT INTO users (username, password, role, permissions, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_DATE, CURRENT_DATE)',
            [username, hashedPassword, derivedRole, JSON.stringify(normalizedPermissions)]
        );

        const rows = await safeQuery(
            `SELECT ${USER_COLUMNS} FROM users WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json(toPublicUser(rows[0]));
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
};

const updateUser = async (req, res) => {
    const { username, password, role, permissions } = req.body;
    const userId = req.params.id;

    try {
        const existingRows = await safeQuery(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [userId]);
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existing = existingRows[0];
        if (username) {
            const usernameCheck = await safeQuery('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
            if (usernameCheck.length > 0) {
                return res.status(409).json({ error: 'Username already exists' });
            }
        }

        const normalizedPermissions = normalizePermissions(
            permissions === undefined ? existing.permissions : permissions,
            role || existing.role
        );
        const derivedRole = roleFromPermissions(normalizedPermissions);

        const fields = ['role = ?', 'permissions = ?', 'updatedAt = CURRENT_DATE'];
        const params = [derivedRole, JSON.stringify(normalizedPermissions)];

        if (username) {
            fields.unshift('username = ?');
            params.unshift(username);
        }

        if (password) {
            fields.push('password = ?');
            params.push(await bcrypt.hash(password, 10));
        }

        params.push(userId);
        await safeQuery(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

        const rows = await safeQuery(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [userId]);
        res.json(toPublicUser(rows[0]));
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
};

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

        const publicUser = toPublicUser(user);
        const token = jwt.sign(
            {
                id: publicUser.id,
                username: publicUser.username,
                role: publicUser.role,
                permissions: publicUser.permissions
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        req.user = {
            id: publicUser.id,
            username: publicUser.username,
            role: publicUser.role,
            permissions: publicUser.permissions
        };

        res.json({
            token,
            user: publicUser
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const rows = await safeQuery(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(toPublicUser(rows[0]));
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
