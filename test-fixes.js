const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testEndpoint = async (name, endpoint) => {
    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
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

const testFixes = async () => {
    console.log('🔧 Testing Route Fixes...\n');
    
    const tests = [
        { name: 'API Info', endpoint: '/api' },
        { name: 'Get Sites', endpoint: '/sites' },
        { name: 'Debug Info', endpoint: '/debug' }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        const success = await testEndpoint(test.name, test.endpoint);
        if (success) passed++;
        console.log(''); // Empty line for readability
    }
    
    console.log('='.repeat(50));
    console.log(`📊 Results: ${passed}/${total} tests passed`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (passed === total) {
        console.log('🎉 All route fixes working!');
    } else {
        console.log('⚠️ Some routes still have issues.');
    }
};

// Run tests if this file is executed directly
if (require.main === module) {
    testFixes();
}

module.exports = { testFixes };
