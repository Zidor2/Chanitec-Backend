const axios = require('axios');

// Simple test runner for quick API validation
const BASE_URL = 'http://localhost:5000/api';

const testEndpoint = async (name, method, endpoint, data = null) => {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
        };

        if (data) config.data = data;

        const response = await axios(config);
        console.log(`✅ ${name} - Status: ${response.status}`);
        return true;
    } catch (error) {
        console.log(`❌ ${name} - Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data: ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
};

const runQuickTests = async () => {
    console.log('🚀 Quick API Test Runner\n');

    const tests = [
        { name: 'Health Check', method: 'GET', endpoint: '/health' },
        { name: 'Database Health', method: 'GET', endpoint: '/db-health' },
        { name: 'API Info', method: 'GET', endpoint: '/api' },
        { name: 'Get Clients', method: 'GET', endpoint: '/clients' },
        { name: 'Get Quotes', method: 'GET', endpoint: '/quotes' },
        { name: 'Get Sites', method: 'GET', endpoint: '/sites' },
        { name: 'Get Items', method: 'GET', endpoint: '/items' },
        { name: 'Get Departments', method: 'GET', endpoint: '/departments' },
        { name: 'Get Employees', method: 'GET', endpoint: '/employees' },
        { name: 'Get Splits', method: 'GET', endpoint: '/splits' },
        { name: 'Debug Info', method: 'GET', endpoint: '/debug' }
    ];

    let passed = 0;
    let total = tests.length;

    for (const test of tests) {
        const success = await testEndpoint(test.name, test.method, test.endpoint, test.data);
        if (success) passed++;
        console.log(''); // Empty line for readability
    }

    console.log('='.repeat(50));
    console.log(`📊 Results: ${passed}/${total} tests passed`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (passed === total) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️ Some tests failed. Check the details above.');
    }
};

// Run tests if this file is executed directly
if (require.main === module) {
    runQuickTests();
}

module.exports = { runQuickTests, testEndpoint };
