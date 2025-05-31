const Employee = require('../models/Employee');

// Get all employees
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll();
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error fetching employees' });
    }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Error fetching employee' });
    }
};

// Create new employee
const createEmployee = async (req, res) => {
    const { full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction } = req.body;

    // Validate required fields
    if (!full_name || !civil_status || !birth_date || !entry_date || !seniority || !contract_type || !job_title || !fonction) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }

    try {
        const newEmployee = await Employee.create(req.body);
        res.status(201).json(newEmployee);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({
            error: 'Error creating employee',
            details: error.message
        });
    }
};

// Update employee
const updateEmployee = async (req, res) => {
    const { full_name, civil_status, birth_date, entry_date, seniority, contract_type, job_title, fonction } = req.body;

    // Validate required fields
    if (!full_name || !civil_status || !birth_date || !entry_date || !seniority || !contract_type || !job_title || !fonction) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }

    try {
        const updatedEmployee = await Employee.update(req.params.id, req.body);
        if (!updatedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(updatedEmployee);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Error updating employee' });
    }
};

// Delete employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        await Employee.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Error deleting employee' });
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};