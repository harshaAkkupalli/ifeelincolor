# API Test Files

This directory contains API endpoint tests using Supertest.

## Files

- `bodyAssessment.api.test.js` - Tests for body assessment endpoints
- `auth.api.test.js` - Template for authentication endpoint tests

## Running Tests

```bash
# Run all API tests
npm test -- tests/api

# Run specific test file
npm test -- tests/api/bodyAssessment.api.test.js
```

## Adding New Tests

1. Create a new file: `yourEndpoint.api.test.js`
2. Follow the pattern from existing test files
3. Import the app and required models
4. Set up database connection in `beforeAll`
5. Write test cases for your endpoints

See `BACKEND_API_TESTING_GUIDE.md` for detailed instructions.









