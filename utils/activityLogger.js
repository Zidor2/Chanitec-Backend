const { safeQuery } = require('./databaseUtils');

const SKIP_PATH_PREFIXES = ['/api/logs', '/api/health', '/api/debug'];
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const ENTITY_LABELS = {
    quotes: 'devis',
    clients: 'client',
    sites: 'site',
    items: 'article',
    'supply-items': 'fourniture',
    'labor-items': 'main-d\'oeuvre',
    employees: 'employé',
    splits: 'équipement',
    planning: 'planning',
    'planning-sites': 'site de planning',
    'planning-splits': 'équipement de planning',
    interventions: 'intervention',
    'intervention-unite-exterieure': 'unité extérieure',
    'intervention-mesure-releve': 'mesure / relevé',
    'intervention-essais-electrique': 'essais électriques',
    'intervention-liaisons-electriques': 'liaisons électriques',
    'intervention-coffret-electrique': 'coffret électrique',
    'intervention-observations': 'observations',
    descriptions: 'description',
    auth: 'utilisateur',
    dashboard: 'tableau de bord'
};

const METHOD_VERBS = {
    POST: 'Création',
    PUT: 'Modification',
    PATCH: 'Modification',
    DELETE: 'Suppression'
};

const NAMED_ACTIONS = [
    { method: 'POST', pattern: /^\/api\/auth\/login\/?$/, action: 'Connexion', entityType: 'auth' },
    { method: 'POST', pattern: /^\/api\/auth\/?$/, action: 'Création d\'un utilisateur', entityType: 'auth' },
    { method: 'PUT', pattern: /^\/api\/auth\/(\d+)\/?$/, action: 'Modification d\'un utilisateur', entityType: 'auth' },
    { method: 'DELETE', pattern: /^\/api\/auth\/(\d+)\/?$/, action: 'Suppression d\'un utilisateur', entityType: 'auth' },
    { method: 'POST', pattern: /^\/api\/quotes\/?$/, action: 'Création d\'un devis', entityType: 'quotes' },
    { method: 'PUT', pattern: /^\/api\/quotes\/([^/]+)\/?$/, action: 'Modification d\'un devis', entityType: 'quotes' },
    { method: 'DELETE', pattern: /^\/api\/quotes\/([^/]+)\/?$/, action: 'Suppression d\'un devis', entityType: 'quotes' },
    { method: 'PATCH', pattern: /^\/api\/quotes\/([^/]+)\/confirm\/?$/, action: 'Confirmation d\'un devis', entityType: 'quotes' },
    { method: 'PATCH', pattern: /^\/api\/quotes\/([^/]+)\/reminder\/?$/, action: 'Rappel d\'un devis', entityType: 'quotes' }
];

const DETAIL_KEYS = [
    'id',
    'clientName',
    'siteName',
    'object',
    'username',
    'name',
    'description',
    'confirmed',
    'number_chanitec',
    'status',
    'permissions'
];

const shouldSkip = (method, path) => {
    if (!MUTATING_METHODS.has(method)) return true;
    return SKIP_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};

const entityTypeFromPath = (path) => {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] !== 'api' || !parts[1]) return null;
    return parts[1];
};

const entityIdFromPath = (path) => {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] !== 'api') return null;
    const maybeId = parts[2];
    if (!maybeId || ['login', 'confirm', 'reminder'].includes(maybeId)) return null;
    return maybeId.slice(0, 64);
};

const describeRequest = (method, path) => {
    for (const rule of NAMED_ACTIONS) {
        if (rule.method !== method) continue;
        const match = path.match(rule.pattern);
        if (match) {
            return {
                action: rule.action,
                entityType: rule.entityType,
                entityId: match[1] || null
            };
        }
    }

    const entityType = entityTypeFromPath(path);
    const label = ENTITY_LABELS[entityType] || entityType || 'ressource';
    const verb = METHOD_VERBS[method] || method;
    return {
        action: `${verb} ${label}`,
        entityType,
        entityId: entityIdFromPath(path)
    };
};

const summarizeDetails = (body) => {
    if (!body || typeof body !== 'object') return null;
    const picked = {};
    for (const key of DETAIL_KEYS) {
        if (body[key] !== undefined && key !== 'password') {
            picked[key] = body[key];
        }
    }
    if (Array.isArray(body.supplyItems)) picked.supplyItemsCount = body.supplyItems.length;
    if (Array.isArray(body.laborItems)) picked.laborItemsCount = body.laborItems.length;
    if (Object.keys(picked).length === 0) return null;
    return JSON.stringify(picked).slice(0, 2000);
};

const clientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
        return forwarded.split(',')[0].trim().slice(0, 45);
    }
    return (req.socket?.remoteAddress || req.ip || '').slice(0, 45) || null;
};

const recordActivity = async ({
    userId,
    username,
    action,
    entityType,
    entityId,
    method,
    path,
    statusCode,
    details,
    ipAddress
}) => {
    await safeQuery(
        `INSERT INTO activity_logs
            (user_id, username, action, entity_type, entity_id, method, path, status_code, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            userId || null,
            username || null,
            action,
            entityType || null,
            entityId || null,
            method,
            path.slice(0, 255),
            statusCode,
            details || null,
            ipAddress || null
        ]
    );
};

const logRequest = async (req, res) => {
    const path = (req.originalUrl || req.url || '').split('?')[0];
    const method = (req.method || '').toUpperCase();
    if (shouldSkip(method, path)) return;

    const described = describeRequest(method, path);
    const username = req.user?.username || req.body?.username || null;
    const entityId = described.entityId || req.body?.id || null;

    try {
        await recordActivity({
            userId: req.user?.id || null,
            username,
            action: described.action,
            entityType: described.entityType,
            entityId: entityId ? String(entityId).slice(0, 64) : null,
            method,
            path,
            statusCode: res.statusCode,
            details: summarizeDetails(req.body),
            ipAddress: clientIp(req)
        });
    } catch (error) {
        console.error('Failed to write activity log:', error.message);
    }
};

module.exports = {
    shouldSkip,
    describeRequest,
    logRequest,
    recordActivity
};
