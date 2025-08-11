# 🧪 API Testing Guide

This guide explains how to test your Chanitec backend API to ensure everything is working correctly without needing to test each frontend function.

## 📋 Test Files Overview

### 1. **`test-simple.js`** - Quick Health Check
- **Purpose**: Fast validation that all endpoints are responding
- **Duration**: ~30 seconds
- **Best for**: Daily checks, quick validation, CI/CD pipelines

### 2. **`test-api.js`** - Comprehensive Test Suite
- **Purpose**: Full CRUD testing of all endpoints
- **Duration**: ~2-3 minutes
- **Best for**: Complete validation, before deployments, debugging issues

## 🚀 How to Run Tests

### Prerequisites
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start your backend server**:
   ```bash
   npm start
   # or
   npm run dev
   ```

3. **Ensure your server is running on port 5000** (or update BASE_URL in test files)

### Quick Health Check (Recommended for daily use)
```bash
npm test
# or
npm run test:health
```

**What it tests**:
- ✅ Health endpoints
- ✅ Database connectivity
- ✅ All GET endpoints
- ✅ Basic API functionality

### Full Comprehensive Test Suite
```bash
npm run test:full
```

**What it tests**:
- ✅ All CRUD operations (Create, Read, Update, Delete)
- ✅ Database transactions
- ✅ Error handling
- ✅ Performance under load
- ✅ Connection pool management
- ✅ All API endpoints with real data

## 📊 What Gets Tested

### Database Health
- Connection pool status
- Database connectivity
- Pool monitoring

### Core APIs
- **Clients**: GET, POST, PUT, DELETE
- **Quotes**: GET, POST, PUT, DELETE (with transactions)
- **Sites**: GET, POST, PUT, DELETE
- **Items**: GET, POST, PUT, DELETE
- **Supply Items**: GET by quote
- **Labor Items**: GET by quote
- **Departments**: GET
- **Employees**: GET
- **Splits**: GET

### Error Handling
- 404 Not Found responses
- 400 Bad Request validation
- Database connection errors
- Transaction rollbacks

### Performance
- Concurrent request handling
- Response times
- Connection pool efficiency

## 🔍 Understanding Test Results

### ✅ PASS
- Endpoint responded correctly
- Expected status code received
- Data format is correct

### ❌ FAIL
- Endpoint didn't respond
- Wrong status code
- Data format issues
- Database errors

### ⚠️ SKIP
- Test couldn't run (e.g., no data available)
- Not a failure, just skipped

## 🛠️ Customizing Tests

### Change Base URL
Edit the `BASE_URL` constant in test files:
```javascript
const BASE_URL = 'http://your-server:port/api';
```

### Adjust Timeouts
Modify the `TEST_TIMEOUT` constant:
```javascript
const TEST_TIMEOUT = 15000; // 15 seconds
```

### Add Custom Tests
Create your own test functions:
```javascript
const testCustomEndpoint = async () => {
    const result = await makeRequest('GET', '/custom-endpoint');
    if (result.success) {
        logTest('Custom Endpoint', 'PASS');
    } else {
        logTest('Custom Endpoint', 'FAIL', result.error);
    }
};
```

## 📈 Interpreting Results

### Perfect Score (100%)
- All endpoints working correctly
- Database connections stable
- No connection leaks
- Ready for production

### Good Score (80-99%)
- Most functionality working
- Minor issues to investigate
- Generally stable

### Poor Score (<80%)
- Significant issues present
- Connection leaks likely
- Database problems
- Needs immediate attention

## 🚨 Common Issues & Solutions

### Connection Timeout Errors
- Check if database is accessible
- Verify connection pool settings
- Check network connectivity

### 404 Errors
- Verify endpoint URLs
- Check route definitions
- Ensure server is running

### Database Errors
- Check database credentials
- Verify table structure
- Check connection limits

### Performance Issues
- Monitor connection pool usage
- Check database query performance
- Verify server resources

## 🔄 Continuous Testing

### Add to CI/CD Pipeline
```yaml
# Example GitHub Actions
- name: Test API
  run: npm test
```

### Scheduled Health Checks
```bash
# Run every hour
0 * * * * cd /path/to/your/app && npm run test:health
```

### Pre-deployment Testing
```bash
# Always run before deploying
npm run test:full
```

## 📝 Test Output Example

```
🚀 Quick API Test Runner

✅ Health Check - Status: 200

✅ Database Health - Status: 200

✅ API Info - Status: 200

✅ Get Clients - Status: 200

✅ Get Quotes - Status: 200

==================================================
📊 Results: 11/11 tests passed
📈 Success Rate: 100.0%
🎉 All tests passed!
```

## 🎯 Best Practices

1. **Run quick tests daily** to catch issues early
2. **Run full tests before deployments** to ensure stability
3. **Monitor test results over time** to identify trends
4. **Use test results** to prioritize bug fixes
5. **Keep tests updated** when adding new endpoints

## 🆘 Troubleshooting

### Tests Won't Run
- Ensure dependencies are installed: `npm install`
- Check if server is running
- Verify port configuration

### All Tests Failing
- Check server logs for errors
- Verify database connectivity
- Check environment variables

### Specific Endpoint Failing
- Check endpoint implementation
- Verify database table structure
- Check authentication/authorization

---

**Need Help?** Check your server logs and database connection status first. The test suite will give you detailed error information to help diagnose issues.
