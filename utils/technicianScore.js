const { safeQuery } = require('./databaseUtils');

const parseScore = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

const parseTechnicianIds = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return [value];
    }
    if (typeof value === 'string' && value.trim()) {
        try {
            return parseTechnicianIds(JSON.parse(value));
        } catch (error) {
            return value
                .split(',')
                .map((item) => Number(item.trim()))
                .filter((item) => Number.isFinite(item));
        }
    }
    return [];
};

const parseSignatureNames = (value) => {
    if (!value) return [];
    return String(value)
        .split(',')
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean);
};

const interventionScore = (clientObservation, chanicObservation) => {
    const client = parseScore(clientObservation);
    const chanic = parseScore(chanicObservation);
    if (client === null && chanic === null) return null;
    if (client === null) return chanic;
    if (chanic === null) return client;
    return (0.7 * chanic) + (0.3 * client);
};

const normalizeEmployeeId = (value) => {
    const id = Number(value);
    return Number.isFinite(id) ? id : null;
};

const matchEmployeeName = (name, employeesByName) => {
    if (employeesByName.has(name)) {
        return employeesByName.get(name);
    }

    const matches = [];
    for (const [fullName, employeeId] of employeesByName.entries()) {
        if (fullName.startsWith(name) || name.startsWith(fullName)) {
            matches.push(employeeId);
        }
    }
    return matches.length === 1 ? matches[0] : null;
};

const resolveSignedEmployeeIds = (row, employeesByName, validIds) => {
    const ids = new Set(
        parseTechnicianIds(row.technician_employee_ids)
            .map(normalizeEmployeeId)
            .filter((id) => id !== null && validIds.has(id))
    );
    for (const name of parseSignatureNames(row.signature_chanic)) {
        const employeeId = matchEmployeeName(name, employeesByName);
        if (employeeId != null) {
            ids.add(employeeId);
        }
    }
    return ids;
};

const computeTechnicianScores = async () => {
    const [rows, employees] = await Promise.all([
        safeQuery(
            `SELECT technician_employee_ids, observations_client, observations_chanic, signature_chanic
             FROM intervention_observations`
        ),
        safeQuery('SELECT id, full_name FROM employee')
    ]);

    const { employeesByName, validIds } = buildEmployeeLookup(employees);

    const totals = new Map();
    for (const row of rows) {
        const score = interventionScore(row.observations_client, row.observations_chanic);
        if (score === null) continue;

        const employeeIds = resolveSignedEmployeeIds(row, employeesByName, validIds);
        for (const employeeId of employeeIds) {
            const current = totals.get(employeeId) || { sum: 0, count: 0 };
            current.sum += score;
            current.count += 1;
            totals.set(employeeId, current);
        }
    }

    const averages = new Map();
    for (const [employeeId, { sum, count }] of totals.entries()) {
        averages.set(employeeId, Math.round(sum / count));
    }
    return averages;
};

const persistTechnicianScores = async () => {
    const scoresById = await computeTechnicianScores();
    const employees = await safeQuery('SELECT id FROM employee');
    for (const employee of employees) {
        const employeeId = normalizeEmployeeId(employee.id);
        const score = employeeId !== null && scoresById.has(employeeId) ? scoresById.get(employeeId) : null;
        await safeQuery('UPDATE employee SET score = ? WHERE id = ?', [score, employee.id]);
    }
    return scoresById;
};

const formatInterventionDate = (value) => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }
    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : String(value);
};

const buildEmployeeLookup = (employees) => {
    const employeesByName = new Map();
    const validIds = new Set();
    for (const employee of employees) {
        const name = String(employee.full_name || '').trim().toLowerCase();
        const employeeId = normalizeEmployeeId(employee.id);
        if (employeeId === null) continue;
        validIds.add(employeeId);
        if (name) {
            employeesByName.set(name, employeeId);
        }
    }
    return { employeesByName, validIds };
};

const findSignedInterventionsForEmployee = async (employeeId) => {
    const id = normalizeEmployeeId(employeeId);
    if (id === null) return [];

    const employees = await safeQuery('SELECT id, full_name FROM employee');
    const { employeesByName, validIds } = buildEmployeeLookup(employees);
    if (!validIds.has(id)) return [];

    const rows = await safeQuery(
        `SELECT
            i.intervention_id,
            i.intervention_date,
            c.name AS client_name,
            o.observations_client,
            o.observations_chanic,
            o.technician_employee_ids,
            o.signature_chanic
         FROM intervention_observations o
         INNER JOIN interventions i ON i.intervention_id = o.intervention_id
         LEFT JOIN clients c ON c.id = i.client_id
         ORDER BY i.intervention_date DESC, i.intervention_id DESC`
    );

    return rows
        .filter((row) => resolveSignedEmployeeIds(row, employeesByName, validIds).has(id))
        .map((row) => ({
            intervention_id: row.intervention_id,
            date: formatInterventionDate(row.intervention_date),
            client: row.client_name || '',
            observations_client: row.observations_client ?? '',
            observations_chanic: row.observations_chanic ?? ''
        }));
};

module.exports = {
    parseScore,
    parseTechnicianIds,
    interventionScore,
    computeTechnicianScores,
    persistTechnicianScores,
    findSignedInterventionsForEmployee
};
