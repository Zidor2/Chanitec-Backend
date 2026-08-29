const PAGE_KEYS = [
    'home',
    'quote',
    'history',
    'clients',
    'items',
    'intervention',
    'planning',
    'org-chart',
    'users',
    'logs',
    'financial',
    'help'
];

const parsePermissions = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch (error) {
            return [];
        }
    }
    return [];
};

const permissionsFromRole = (role) => {
    if (role === 'admin') return ['all'];
    if (role === 'editor') {
        return ['home', 'quote', 'history', 'clients', 'items', 'intervention', 'planning', 'org-chart', 'help'];
    }
    if (role === 'user') {
        return ['home', 'quote', 'history', 'planning', 'help'];
    }
    return ['home', 'history', 'planning', 'help'];
};

const normalizePermissions = (input, role) => {
    if (input === undefined || input === null || input === '') {
        return permissionsFromRole(role);
    }

    const parsed = parsePermissions(input);
    if (parsed.includes('all')) return ['all'];
    const known = [...new Set(parsed.filter((key) => PAGE_KEYS.includes(key)))];
    return known.length > 0 ? known : permissionsFromRole(role);
};

const roleFromPermissions = (permissions) => {
    if (permissions.includes('all') || permissions.includes('users')) {
        return 'admin';
    }
    return 'user';
};

const canManageUsers = (user) => {
    if (!user) return false;
    const permissions = normalizePermissions(user.permissions, user.role);
    return user.role === 'admin' || permissions.includes('all') || permissions.includes('users');
};

const canSeeAllQuotes = (user) => {
    if (!user) return false;
    const permissions = normalizePermissions(user.permissions, user.role);
    return user.role === 'admin' || permissions.includes('all');
};

const canSeeLogs = (user) => {
    if (!user) return false;
    const permissions = normalizePermissions(user.permissions, user.role);
    return user.role === 'admin' || permissions.includes('all') || permissions.includes('logs');
};

const toPublicUser = (row) => {
    if (!row) return null;
    const permissions = normalizePermissions(row.permissions, row.role);
    return {
        id: row.id,
        username: row.username,
        role: row.role,
        permissions,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
};

module.exports = {
    PAGE_KEYS,
    parsePermissions,
    permissionsFromRole,
    normalizePermissions,
    roleFromPermissions,
    canManageUsers,
    canSeeAllQuotes,
    canSeeLogs,
    toPublicUser
};
