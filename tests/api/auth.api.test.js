/**
 * Example API Tests for Authentication Endpoints
 * This is a template you can use for testing auth routes
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../../index');
const { expect, describe, it, beforeAll, afterAll, beforeEach } = require('@jest/globals');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  jest.setTimeout(30000);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('POST /api/auth/login - User Login', () => {
  it('should login with valid credentials', async () => {
    // First, you might need to create a test user
    // Then test login
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200); // Adjust based on your actual status codes

    expect(response.body).toHaveProperty('token');
    expect(response.body.status).toBe('success');
  });

  it('should return 401 with invalid credentials', async () => {
    const loginData = {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401); // Unauthorized

    expect(response.body.status).toBe('error');
  });

  it('should return 400 when email is missing', async () => {
    const loginData = {
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(400);

    expect(response.body.status).toBe('error');
  });
});

describe('POST /api/auth/register - User Registration', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'patient'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.body).toHaveProperty('email', userData.email);
  });

  it('should return 400 if email already exists', async () => {
    // First create a user
    const userData = {
      email: 'existing@example.com',
      password: 'password123',
      name: 'Existing User'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Try to register again with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.status).toBe('error');
  });
});









