const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Employee = sequelize.define('Employee', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    civil_status: {
        type: DataTypes.CHAR(1),
        allowNull: false
    },
    birth_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    entry_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    seniority: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    contract_type: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    job_title: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    fonction: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    sub_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    type_description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Employee;