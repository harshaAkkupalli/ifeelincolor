# 🚀 API Testing Quick Start

Get started with backend API testing in 5 minutes!

---

## ✅ Step 1: Verify Setup

Everything is already installed! ✅

- ✅ Jest
- ✅ Supertest  
- ✅ mongodb-memory-server

---

## ✅ Step 2: Run Example Tests

```powershell
cd rough-main
npm test
```

This will run all tests including the API tests.

---

## ✅ Step 3: Run API Tests Only

```powershell
npm test -- tests/api
```

---

## ✅ Step 4: Run Specific Test File

```powershell
npm test -- tests/api/bodyAssessment.api.test.js
```

---

## 📝 What Tests Are Included?

### 1. Body Assessment API Tests
**File:** `tests/api/bodyAssessment.api.test.js`

Tests for:
- ✅ POST `/api/bodytest` - Create assessment
- ✅ GET `/api/bodytest` - Get all assessments
- ✅ GET `/api/bodytest/:id` - Get by ID
- ✅ PUT `/api/bodytest/:id` - Update assessment
- ✅ DELETE `/api/bodytest/:id` - Delete assessment
- ✅ POST `/api/bodytest/take` - Submit assessment
- ✅ GET `/api/questions/:partId` - Get questions by part

### 2. Auth API Tests (Template)
**File:** `tests/api/auth.api.test.js`

Template for testing:
- Login
- Registration
- Authentication

---

## 🎯 Create Your Own Tests

### Quick Template

```javascript
const request = require('supertest');
const { app } = require('../../index');
const { expect, describe, it, beforeAll, afterAll, beforeEach } = require('@jest/globals');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear test data
});

describe('GET /api/your-endpoint', () => {
  it('should return success', async () => {
    const response = await request(app)
      .get('/api/your-endpoint')
      .expect(200);

    expect(response.body.status).toBe('success');
  });
});
```

---

## 📚 Full Documentation

See `BACKEND_API_TESTING_GUIDE.md` for:
- Detailed examples
- Best practices
- Troubleshooting
- Advanced patterns

---

## 🐛 Common Issues

### Issue: Tests fail with database connection error

**Fix:** Make sure you're using `mongodb-memory-server` in tests (already set up in example tests).

### Issue: "Cannot find module '../../index'"

**Fix:** Check that `index.js` exports `{ app, io }`:
```javascript
module.exports = { app, io };
```

### Issue: Tests are slow

**Fix:** 
- Tests use in-memory database (fast)
- If still slow, check for real HTTP calls or external services

---

## ✅ Next Steps

1. **Run the tests** to see them in action
2. **Read the guide** (`BACKEND_API_TESTING_GUIDE.md`) for details
3. **Create tests** for your other endpoints
4. **Add to CI/CD** to run tests automatically

---

**That's it! You're ready to test your APIs! 🎉**









