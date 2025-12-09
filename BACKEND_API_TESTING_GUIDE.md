# 🧪 Backend API Testing Guide

Complete guide for testing your Express.js API endpoints using Jest and Supertest.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Writing Tests](#writing-tests)
4. [Running Tests](#running-tests)
5. [Test Examples](#test-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

### What is API Testing?

API testing verifies that your HTTP endpoints work correctly:
- ✅ Request/Response handling
- ✅ Status codes
- ✅ Data validation
- ✅ Authentication/Authorization
- ✅ Error handling

### Tools Used

- **Jest**: Test framework
- **Supertest**: HTTP assertion library for testing Express routes
- **mongodb-memory-server**: In-memory MongoDB for testing (no real database needed)

---

## 🚀 Setup

### 1. Install Dependencies (Already Done!)

```bash
npm install --save-dev jest supertest mongodb-memory-server
```

### 2. Test Configuration

Your `jest.config.js` is already set up! ✅

### 3. Project Structure

```
rough-main/
├── tests/
│   ├── api/                    # API endpoint tests
│   │   ├── bodyAssessment.api.test.js
│   │   └── auth.api.test.js
│   ├── setup.js                # Test setup file
│   └── bodyAssessment.test.js  # Model tests
├── jest.config.js
└── package.json
```

---

## ✍️ Writing Tests

### Basic Test Structure

```javascript
const request = require('supertest');
const { app } = require('../../index');
const { expect, describe, it, beforeAll, afterAll, beforeEach } = require('@jest/globals');

describe('GET /api/endpoint', () => {
  it('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body.status).toBe('success');
  });
});
```

### Test Lifecycle Hooks

```javascript
beforeAll(async () => {
  // Runs once before all tests
  // Setup database connection
});

afterAll(async () => {
  // Runs once after all tests
  // Cleanup database
});

beforeEach(async () => {
  // Runs before each test
  // Clear database
});
```

---

## 🏃 Running Tests

### Run All Tests

```bash
cd rough-main
npm test
```

### Run Specific Test File

```bash
npm test -- tests/api/bodyAssessment.api.test.js
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

---

## 📝 Test Examples

### Example 1: GET Request

```javascript
describe('GET /api/bodytest', () => {
  it('should return all assessments', async () => {
    const response = await request(app)
      .get('/api/bodytest')
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.body)).toBe(true);
  });
});
```

### Example 2: POST Request

```javascript
describe('POST /api/bodytest', () => {
  it('should create a new assessment', async () => {
    const data = {
      question: 'How do you feel?',
      answer: 'Good',
      type: 'mcq',
      score: 10
    };

    const response = await request(app)
      .post('/api/bodytest')
      .send(data)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.body.question).toBe(data.question);
  });
});
```

### Example 3: PUT Request (Update)

```javascript
describe('PUT /api/bodytest/:id', () => {
  it('should update an assessment', async () => {
    // First create an assessment
    const assessment = await BodyAssessment.create({...});

    const updateData = {
      question: 'Updated question'
    };

    const response = await request(app)
      .put(`/api/bodytest/${assessment._id}`)
      .send(updateData)
      .expect(200);

    expect(response.body.body.question).toBe('Updated question');
  });
});
```

### Example 4: DELETE Request

```javascript
describe('DELETE /api/bodytest/:id', () => {
  it('should delete an assessment', async () => {
    const assessment = await BodyAssessment.create({...});

    const response = await request(app)
      .delete(`/api/bodytest/${assessment._id}`)
      .expect(200);

    // Verify deletion
    const deleted = await BodyAssessment.findById(assessment._id);
    expect(deleted).toBeNull();
  });
});
```

### Example 5: With Authentication

```javascript
describe('GET /api/protected', () => {
  it('should access protected route with token', async () => {
    // First login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    const token = loginResponse.body.token;

    // Use token in protected route
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.status).toBe('success');
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .get('/api/protected')
      .expect(401);

    expect(response.body.status).toBe('error');
  });
});
```

### Example 6: Error Handling

```javascript
describe('POST /api/bodytest', () => {
  it('should return 400 for invalid data', async () => {
    const invalidData = {
      // Missing required fields
    };

    const response = await request(app)
      .post('/api/bodytest')
      .send(invalidData)
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBeDefined();
  });

  it('should return 404 for non-existent resource', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/bodytest/${fakeId}`)
      .expect(404);

    expect(response.body.status).toBe('error');
  });
});
```

---

## ✅ Best Practices

### 1. Test Structure

- **Arrange**: Set up test data
- **Act**: Make the API request
- **Assert**: Verify the response

```javascript
it('should create assessment', async () => {
  // Arrange
  const data = { question: 'Test', answer: 'Answer' };

  // Act
  const response = await request(app)
    .post('/api/bodytest')
    .send(data);

  // Assert
  expect(response.status).toBe(201);
  expect(response.body.body.question).toBe('Test');
});
```

### 2. Test Isolation

- Each test should be independent
- Clean up data in `beforeEach`
- Don't rely on test execution order

### 3. Descriptive Test Names

✅ Good:
```javascript
it('should return 404 when assessment ID does not exist', ...)
```

❌ Bad:
```javascript
it('test 1', ...)
```

### 4. Test One Thing at a Time

✅ Good:
```javascript
it('should return 200 status code', ...)
it('should return correct data structure', ...)
```

❌ Bad:
```javascript
it('should return 200 and correct data and handle errors', ...)
```

### 5. Use Meaningful Assertions

```javascript
// ✅ Good
expect(response.body.status).toBe('success');
expect(response.body.body).toHaveProperty('question');

// ❌ Less clear
expect(response.body).toBeDefined();
```

---

## 🔧 Creating Tests for Your Endpoints

### Step-by-Step Guide

1. **Choose an endpoint to test**
   - Example: `POST /api/bodytest`

2. **Create a test file**
   - `tests/api/bodyAssessment.api.test.js`

3. **Import dependencies**
   ```javascript
   const request = require('supertest');
   const { app } = require('../../index');
   ```

4. **Set up database**
   ```javascript
   beforeAll(async () => {
     mongoServer = await MongoMemoryServer.create();
     await mongoose.connect(mongoServer.getUri());
   });
   ```

5. **Write test cases**
   - Happy path (success cases)
   - Error cases (validation, not found, etc.)
   - Edge cases

6. **Run tests**
   ```bash
   npm test
   ```

---

## 📊 Test Coverage

### Check Coverage

```bash
npm run test:coverage
```

This will show:
- Which files are tested
- Which lines are covered
- Coverage percentage

### Aim for:
- **80%+ coverage** for critical endpoints
- **100% coverage** for authentication/security
- **60%+ coverage** for general endpoints

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '../../index'"

**Fix:** Make sure `index.js` exports the `app`:
```javascript
module.exports = { app, io };
```

### Issue: Tests connect to real database

**Fix:** Use `mongodb-memory-server` in tests:
```javascript
const mongoServer = await MongoMemoryServer.create();
await mongoose.connect(mongoServer.getUri());
```

### Issue: "Port already in use"

**Fix:** Don't start the server in tests. Supertest handles it automatically.

### Issue: Tests are slow

**Fix:** 
- Use in-memory database
- Clean up data properly
- Don't make real HTTP calls

### Issue: Authentication tests failing

**Fix:** Make sure to:
- Create test users in `beforeAll`
- Use correct token format
- Set headers properly

---

## 📚 Example Test Files

I've created example test files for you:

1. **`tests/api/bodyAssessment.api.test.js`** - Complete API tests for body assessments
2. **`tests/api/auth.api.test.js`** - Template for auth endpoint tests

Use these as templates for testing other endpoints!

---

## 🎯 Quick Reference

### Common HTTP Status Codes

- `200` - OK (successful GET, PUT)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (authorization failed)
- `404` - Not Found
- `500` - Internal Server Error

### Common Supertest Methods

```javascript
request(app)
  .get('/api/endpoint')           // GET request
  .post('/api/endpoint')          // POST request
  .put('/api/endpoint/:id')      // PUT request
  .delete('/api/endpoint/:id')    // DELETE request
  .send({ data: 'value' })       // Send request body
  .set('Authorization', 'Bearer token')  // Set headers
  .expect(200)                    // Assert status code
```

---

## 🚀 Next Steps

1. **Run the example tests:**
   ```bash
   npm test -- tests/api/bodyAssessment.api.test.js
   ```

2. **Create tests for your other endpoints:**
   - Copy the template
   - Modify for your specific endpoint
   - Add test cases

3. **Add to CI/CD:**
   - Run tests automatically on push
   - Fail builds if tests fail

---

## 💡 Tips

- ✅ Write tests before fixing bugs (TDD)
- ✅ Test both success and failure cases
- ✅ Keep tests simple and focused
- ✅ Use descriptive test names
- ✅ Clean up test data
- ✅ Mock external services (if needed)

---

**Happy Testing! 🎉**









