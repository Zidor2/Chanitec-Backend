const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Get all employees
router.get('/', employeeController.getAllEmployees);

// Get interventions signed by an employee
router.get('/:id/interventions', employeeController.getEmployeeInterventions);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Create new employee
router.post('/', employeeController.createEmployee);

// Update employee
router.put('/:id', employeeController.updateEmployee);

// Delete employee
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;