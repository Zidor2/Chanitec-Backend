const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_TIMEOUT = 10000; // 10 seconds timeout for each test

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let testResults = [];

// Helper function to log test results
const logTest = (testName, status, details = '') => {
    totalTests++;
    const timestamp = new Date().toISOString();
    
    if (status === 'PASS') {
        passedTests++;
        console.log(`✅ ${testName}`.green);
        testResults.push({ test: testName, status: 'PASS', timestamp, details });
    } else {
        failedTests++;
        console.log(`❌ ${testName}`.red);
        console.log(`   Details: ${details}`.red);
        testResults.push({ test: testName, status: 'FAIL', timestamp, details });
    }
};

// Helper function to make API requests with timeout
const makeRequest = async (method, endpoint, data = null, timeout = TEST_TIMEOUT) => {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.message, 
            status: error.response?.status,
            data: error.response?.data 
        };
    }
};

// Test database health
const testDatabaseHealth = async () => {
    console.log('\n🔍 Testing Database Health...'.cyan);
    
    // Test basic health endpoint
    const healthResult = await makeRequest('GET', '/health');
    if (healthResult.success) {
        logTest('Basic Health Check', 'PASS');
    } else {
        logTest('Basic Health Check', 'FAIL', healthResult.error);
    }
    
    // Test database health endpoint
    const dbHealthResult = await makeRequest('GET', '/db-health');
    if (dbHealthResult.success) {
        logTest('Database Health Check', 'PASS');
        console.log(`   Database Status: ${dbHealthResult.data.status}`);
        console.log(`   Pool Status: ${JSON.stringify(dbHealthResult.data.pool)}`);
    } else {
        logTest('Database Health Check', 'FAIL', dbHealthResult.error);
    }
};

// Test clients API
const testClientsAPI = async () => {
    console.log('\n👥 Testing Clients API...'.cyan);
    
    // Test GET all clients
    const getAllResult = await makeRequest('GET', '/clients');
    if (getAllResult.success) {
        logTest('GET /clients', 'PASS', `Found ${getAllResult.data.length} clients`);
    } else {
        logTest('GET /clients', 'FAIL', getAllResult.error);
    }
    
    // Test GET client by ID (if clients exist)
    if (getAllResult.success && getAllResult.data.length > 0) {
        const firstClient = getAllResult.data[0];
        const getByIdResult = await makeRequest('GET', `/clients/${firstClient.id}`);
        if (getByIdResult.success) {
            logTest('GET /clients/:id', 'PASS');
        } else {
            logTest('GET /clients/:id', 'FAIL', getByIdResult.error);
        }
    } else {
        logTest('GET /clients/:id', 'SKIP', 'No clients available for testing');
    }
    
    // Test POST create client
    const testClient = {
        name: `Test Client ${Date.now()}`,
        Taux_marge: 15.5
    };
    
    const createResult = await makeRequest('POST', '/clients', testClient);
    if (createResult.success) {
        logTest('POST /clients', 'PASS', `Created client: ${createResult.data.name}`);
        
        // Test PUT update client
        const updateData = { name: `Updated ${testClient.name}`, Taux_marge: 20.0 };
        const updateResult = await makeRequest('PUT', `/clients/${createResult.data.id}`, updateData);
        if (updateResult.success) {
            logTest('PUT /clients/:id', 'PASS');
        } else {
            logTest('PUT /clients/:id', 'FAIL', updateResult.error);
        }
        
        // Test DELETE client
        const deleteResult = await makeRequest('DELETE', `/clients/${createResult.data.id}`);
        if (deleteResult.success) {
            logTest('DELETE /clients/:id', 'PASS');
        } else {
            logTest('DELETE /clients/:id', 'FAIL', deleteResult.error);
        }
    } else {
        logTest('POST /clients', 'FAIL', createResult.error);
    }
};

// Test quotes API
const testQuotesAPI = async () => {
    console.log('\n📋 Testing Quotes API...'.cyan);
    
    // Test GET all quotes
    const getAllResult = await makeRequest('GET', '/quotes');
    if (getAllResult.success) {
        logTest('GET /quotes', 'PASS', `Found ${getAllResult.data.length} quotes`);
    } else {
        logTest('GET /quotes', 'FAIL', getAllResult.error);
    }
    
    // Test GET quote by ID (if quotes exist)
    if (getAllResult.success && getAllResult.data.length > 0) {
        const firstQuote = getAllResult.data[0];
        const getByIdResult = await makeRequest('GET', `/quotes/${firstQuote.id}`);
        if (getByIdResult.success) {
            logTest('GET /quotes/:id', 'PASS');
        } else {
            logTest('GET /quotes/:id', 'FAIL', getByIdResult.error);
        }
    } else {
        logTest('GET /quotes/:id', 'SKIP', 'No quotes available for testing');
    }
    
    // Test POST create quote
    const testQuote = {
        clientName: `Test Client ${Date.now()}`,
        siteName: `Test Site ${Date.now()}`,
        object: 'Test Quote Object',
        date: new Date().toISOString().split('T')[0],
        supplyDescription: 'Test supply description',
        laborDescription: 'Test labor description',
        supplyExchangeRate: 1.0,
        supplyMarginRate: 15.0,
        laborExchangeRate: 1.0,
        laborMarginRate: 20.0,
        totalSuppliesHT: 1000.0,
        totalLaborHT: 500.0,
        totalHT: 1500.0,
        tva: 20.0,
        totalTTC: 1800.0,
        remise: 0.0,
        supplyItems: [
            {
                description: 'Test Supply Item',
                quantity: 2,
                priceEuro: 100.0,
                priceDollar: 110.0,
                unitPriceDollar: 55.0,
                totalPriceDollar: 110.0
            }
        ],
        laborItems: [
            {
                description: 'Test Labor Item',
                nbTechnicians: 1,
                nbHours: 8,
                weekendMultiplier: 1.0,
                priceEuro: 50.0,
                priceDollar: 55.0,
                unitPriceDollar: 6.875,
                totalPriceDollar: 55.0
            }
        ]
    };
    
    const createResult = await makeRequest('POST', '/quotes', testQuote);
    if (createResult.success) {
        logTest('POST /quotes', 'PASS', `Created quote: ${createResult.data.id}`);
        
        // Test PUT update quote
        const updateData = { ...testQuote, object: 'Updated Test Quote Object' };
        const updateResult = await makeRequest('PUT', `/quotes/${createResult.data.id}`, updateData);
        if (updateResult.success) {
            logTest('PUT /quotes/:id', 'PASS');
        } else {
            logTest('PUT /quotes/:id', 'FAIL', updateResult.error);
        }
        
        // Test DELETE quote
        const deleteResult = await makeRequest('DELETE', `/quotes/${createResult.data.id}`);
        if (deleteResult.success) {
            logTest('DELETE /quotes/:id', 'PASS');
        } else {
            logTest('DELETE /quotes/:id', 'FAIL', deleteResult.error);
        }
    } else {
        logTest('POST /quotes', 'FAIL', createResult.error);
    }
};

// Test sites API
const testSitesAPI = async () => {
    console.log('\n🏗️ Testing Sites API...'.cyan);
    
    // Test GET all sites
    const getAllResult = await makeRequest('GET', '/sites');
    if (getAllResult.success) {
        logTest('GET /sites', 'PASS', `Found ${getAllResult.data.length} sites`);
    } else {
        logTest('GET /sites', 'FAIL', getAllResult.error);
    }
    
    // Test GET site by ID (if sites exist)
    if (getAllResult.success && getAllResult.data.length > 0) {
        const firstSite = getAllResult.data[0];
        const getByIdResult = await makeRequest('GET', `/sites/${firstSite.id}`);
        if (getByIdResult.success) {
            logTest('GET /sites/:id', 'PASS');
        } else {
            logTest('GET /sites/:id', 'FAIL', getByIdResult.error);
        }
    } else {
        logTest('GET /sites/:id', 'SKIP', 'No sites available for testing');
    }
};

// Test items API
const testItemsAPI = async () => {
    console.log('\n📦 Testing Items API...'.cyan);
    
    // Test GET all items
    const getAllResult = await makeRequest('GET', '/items');
    if (getAllResult.success) {
        logTest('GET /items', 'PASS', `Found ${getAllResult.data.length} items`);
    } else {
        logTest('GET /items', 'FAIL', getAllResult.error);
    }
    
    // Test GET item by ID (if items exist)
    if (getAllResult.success && getAllResult.data.length > 0) {
        const firstItem = getAllResult.data[0];
        const getByIdResult = await makeRequest('GET', `/items/${firstItem.id}`);
        if (getByIdResult.success) {
            logTest('GET /items/:id', 'PASS');
        } else {
            logTest('GET /items/:id', 'FAIL', getByIdResult.error);
        }
    } else {
        logTest('GET /items/:id', 'SKIP', 'No items available for testing');
    }
    
    // Test POST create item
    const testItem = {
        description: `Test Item ${Date.now()}`,
        price: 99.99,
        quantity: 10
    };
    
    const createResult = await makeRequest('POST', '/items', testItem);
    if (createResult.success) {
        logTest('POST /items', 'PASS', `Created item: ${createResult.data.description}`);
        
        // Test PUT update item
        const updateData = { ...testItem, price: 149.99 };
        const updateResult = await makeRequest('PUT', `/items/${createResult.data.id}`, updateData);
        if (updateResult.success) {
            logTest('PUT /items/:id', 'PASS');
        } else {
            logTest('PUT /items/:id', 'FAIL', updateResult.error);
        }
        
        // Test DELETE item
        const deleteResult = await makeRequest('DELETE', `/items/${createResult.data.id}`);
        if (deleteResult.success) {
            logTest('DELETE /items/:id', 'PASS');
        } else {
            logTest('DELETE /items/:id', 'FAIL', deleteResult.error);
        }
    } else {
        logTest('POST /items', 'FAIL', createResult.error);
    }
};

// Test supply items API
const testSupplyItemsAPI = async () => {
    console.log('\n📦 Testing Supply Items API...'.cyan);
    
    // Test GET supply items by quote ID (if quotes exist)
    const quotesResult = await makeRequest('GET', '/quotes');
    if (quotesResult.success && quotesResult.data.length > 0) {
        const firstQuote = quotesResult.data[0];
        const getByQuoteResult = await makeRequest('GET', `/supply-items/${firstQuote.id}`);
        if (getByQuoteResult.success) {
            logTest('GET /supply-items/:quoteId', 'PASS', `Found ${getByQuoteResult.data.length} supply items`);
        } else {
            logTest('GET /supply-items/:quoteId', 'FAIL', getByQuoteResult.error);
        }
    } else {
        logTest('GET /supply-items/:quoteId', 'SKIP', 'No quotes available for testing');
    }
};

// Test labor items API
const testLaborItemsAPI = async () => {
    console.log('\n👷 Testing Labor Items API...'.cyan);
    
    // Test GET labor items by quote ID (if quotes exist)
    const quotesResult = await makeRequest('GET', '/quotes');
    if (quotesResult.success && quotesResult.data.length > 0) {
        const firstQuote = quotesResult.data[0];
        const getByQuoteResult = await makeRequest('GET', `/labor-items/${firstQuote.id}`);
        if (getByQuoteResult.success) {
            logTest('GET /labor-items/:quoteId', 'PASS', `Found ${getByQuoteResult.data.length} labor items`);
        } else {
            logTest('GET /labor-items/:quoteId', 'FAIL', getByQuoteResult.error);
        }
    } else {
        logTest('GET /labor-items/:quoteId', 'SKIP', 'No quotes available for testing');
    }
};

// Test departments API
const testDepartmentsAPI = async () => {
    console.log('\n🏢 Testing Departments API...'.cyan);
    
    // Test GET all departments
    const getAllResult = await makeRequest('GET', '/departments');
    if (getAllResult.success) {
        logTest('GET /departments', 'PASS', `Found ${getAllResult.data.length} departments`);
    } else {
        logTest('GET /departments', 'FAIL', getAllResult.error);
    }
};

// Test employees API
const testEmployeesAPI = async () => {
    console.log('\n👤 Testing Employees API...'.cyan);
    
    // Test GET all employees
    const getAllResult = await makeRequest('GET', '/employees');
    if (getAllResult.success) {
        logTest('GET /employees', 'PASS', `Found ${getAllResult.data.length} employees`);
    } else {
        logTest('GET /employees', 'FAIL', getAllResult.error);
    }
};

// Test splits API
const testSplitsAPI = async () => {
    console.log('\n✂️ Testing Splits API...'.cyan);
    
    // Test GET all splits
    const getAllResult = await makeRequest('GET', '/splits');
    if (getAllResult.success) {
        logTest('GET /splits', 'PASS', `Found ${getAllResult.data.length} splits`);
    } else {
        logTest('GET /splits', 'FAIL', getAllResult.error);
    }
};

// Test debug API
const testDebugAPI = async () => {
    console.log('\n🐛 Testing Debug API...'.cyan);
    
    // Test GET debug info
    const debugResult = await makeRequest('GET', '/debug');
    if (debugResult.success) {
        logTest('GET /debug', 'PASS');
    } else {
        logTest('GET /debug', 'FAIL', debugResult.error);
    }
};

// Test API info endpoint
const testAPIInfo = async () => {
    console.log('\nℹ️ Testing API Info...'.cyan);
    
    const apiInfoResult = await makeRequest('GET', '/');
    if (apiInfoResult.success) {
        logTest('GET /', 'PASS');
    } else {
        logTest('GET /', 'FAIL', apiInfoResult.error);
    }
    
    const endpointsResult = await makeRequest('GET', '/api');
    if (endpointsResult.success) {
        logTest('GET /api', 'PASS');
    } else {
        logTest('GET /api', 'FAIL', endpointsResult.error);
    }
};

// Test error handling
const testErrorHandling = async () => {
    console.log('\n⚠️ Testing Error Handling...'.cyan);
    
    // Test 404 for non-existent endpoint
    const notFoundResult = await makeRequest('GET', '/non-existent-endpoint');
    if (!notFoundResult.success && notFoundResult.status === 404) {
        logTest('404 Error Handling', 'PASS');
    } else {
        logTest('404 Error Handling', 'FAIL', `Expected 404, got ${notFoundResult.status}`);
    }
    
    // Test invalid client creation
    const invalidClientResult = await makeRequest('POST', '/clients', {});
    if (!invalidClientResult.success && invalidClientResult.status === 400) {
        logTest('400 Error Handling', 'PASS');
    } else {
        logTest('400 Error Handling', 'FAIL', `Expected 400, got ${invalidClientResult.status}`);
    }
};

// Performance test
const testPerformance = async () => {
    console.log('\n⚡ Testing Performance...'.cyan);
    
    const startTime = Date.now();
    const promises = [];
    
    // Make 10 concurrent requests to test performance
    for (let i = 0; i < 10; i++) {
        promises.push(makeRequest('GET', '/health'));
    }
    
    try {
        const results = await Promise.all(promises);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const successCount = results.filter(r => r.success).length;
        if (successCount === 10) {
            logTest('Concurrent Requests (10)', 'PASS', `Completed in ${duration}ms`);
        } else {
            logTest('Concurrent Requests (10)', 'FAIL', `${successCount}/10 successful`);
        }
    } catch (error) {
        logTest('Concurrent Requests (10)', 'FAIL', error.message);
    }
};

// Main test runner
const runAllTests = async () => {
    console.log('🚀 Starting Comprehensive API Test Suite...'.bold.cyan);
    console.log(`📍 Testing API at: ${BASE_URL}`.gray);
    console.log(`⏱️  Test timeout: ${TEST_TIMEOUT}ms`.gray);
    
    try {
        // Run all test suites
        await testDatabaseHealth();
        await testAPIInfo();
        await testClientsAPI();
        await testQuotesAPI();
        await testSitesAPI();
        await testItemsAPI();
        await testSupplyItemsAPI();
        await testLaborItemsAPI();
        await testDepartmentsAPI();
        await testEmployeesAPI();
        await testSplitsAPI();
        await testDebugAPI();
        await testErrorHandling();
        await testPerformance();
        
        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY'.bold);
        console.log('='.repeat(60));
        console.log(`Total Tests: ${totalTests}`.cyan);
        console.log(`✅ Passed: ${passedTests}`.green);
        console.log(`❌ Failed: ${failedTests}`.red);
        console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`.bold);
        
        if (failedTests > 0) {
            console.log('\n❌ FAILED TESTS:'.red);
            testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`   - ${r.test}: ${r.details}`.red));
        }
        
        console.log('\n' + '='.repeat(60));
        
        if (failedTests === 0) {
            console.log('🎉 All tests passed! Your backend is working perfectly!'.bold.green);
        } else {
            console.log('⚠️  Some tests failed. Please check the details above.'.bold.yellow);
        }
        
    } catch (error) {
        console.error('💥 Test suite crashed:', error.message);
        process.exit(1);
    }
};

// Export for use in other files
module.exports = {
    runAllTests,
    makeRequest,
    logTest
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}
