/**
 * API Tests for Body Assessment Endpoints
 * Tests the actual HTTP endpoints using Supertest
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../../index'); // Import your Express app
const BodyAssessment = require('../../models/BodyAssessment');
const { expect, describe, it, beforeAll, afterAll, beforeEach } = require('@jest/globals');

let mongoServer;
let authToken; // If you need authentication

// Setup test database
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
  await BodyAssessment.deleteMany({});
});

describe('POST /api/bodytest - Create Body Assessment', () => {
  it('should create a new body assessment successfully', async () => {
    const assessmentData = {
      question: 'How does your shoulder feel?',
      answer: 'Joyful',
      type: 'mcq',
      score: 10,
      part: new mongoose.Types.ObjectId().toString(),
      mcqOptions: [
        {
          text: 'Joyful',
          color: '#FFC107',
          emotionHierarchy: {
            primary: {
              id: 'joy',
              name: 'Joy',
              color: '#FFD700'
            },
            secondary: {
              id: 'content',
              name: 'Content',
              color: '#FFD700'
            },
            tertiary: {
              id: 'joyful',
              name: 'Joyful',
              color: '#FFC107',
              description: 'Full of happiness'
            }
          }
        }
      ]
    };

    const response = await request(app)
      .post('/api/bodytest')
      .send(assessmentData)
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.body).toBeDefined();
    expect(response.body.body.question).toBe(assessmentData.question);
    expect(response.body.message).toContain('created successfully');
  });

  it('should return 500 if required fields are missing', async () => {
    const invalidData = {
      question: 'Test question'
      // Missing required fields
    };

    const response = await request(app)
      .post('/api/bodytest')
      .send(invalidData)
      .expect(500);

    expect(response.body.status).toBe('error');
  });
});

describe('GET /api/bodytest - Get All Body Assessments', () => {
  it('should get all body assessments', async () => {
    // Create test assessments
    await BodyAssessment.create({
      question: 'Question 1',
      answer: 'Answer 1',
      type: 'mcq',
      score: 10,
      part: new mongoose.Types.ObjectId(),
      mcqOptions: []
    });

    await BodyAssessment.create({
      question: 'Question 2',
      answer: 'Answer 2',
      type: 'mcq',
      score: 20,
      part: new mongoose.Types.ObjectId(),
      mcqOptions: []
    });

    const response = await request(app)
      .get('/api/bodytest')
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.body)).toBe(true);
    expect(response.body.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should return empty array when no assessments exist', async () => {
    const response = await request(app)
      .get('/api/bodytest')
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.body)).toBe(true);
    expect(response.body.body.length).toBe(0);
  });
});

describe('GET /api/bodytest/:id - Get Body Assessment by ID', () => {
  it('should get a body assessment by ID', async () => {
    const assessment = await BodyAssessment.create({
      question: 'Test Question',
      answer: 'Test Answer',
      type: 'mcq',
      score: 10,
      part: new mongoose.Types.ObjectId(),
      mcqOptions: []
    });

    const response = await request(app)
      .get(`/api/bodytest/${assessment._id}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.body).toBeDefined();
    expect(response.body.body._id.toString()).toBe(assessment._id.toString());
    expect(response.body.body.question).toBe('Test Question');
  });

  it('should return 404 for non-existent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/bodytest/${fakeId}`)
      .expect(404);

    expect(response.body.status).toBe('error');
  });

  it('should return 400 for invalid ID format', async () => {
    const response = await request(app)
      .get('/api/bodytest/invalid-id')
      .expect(400);

    expect(response.body.status).toBe('error');
  });
});

describe('PUT /api/bodytest/:id - Update Body Assessment', () => {
  it('should update a body assessment successfully', async () => {
    const assessment = await BodyAssessment.create({
      question: 'Original Question',
      answer: 'Original Answer',
      type: 'mcq',
      score: 10,
      part: new mongoose.Types.ObjectId(),
      mcqOptions: []
    });

    const updateData = {
      question: 'Updated Question',
      answer: 'Updated Answer',
      score: 20
    };

    const response = await request(app)
      .put(`/api/bodytest/${assessment._id}`)
      .send(updateData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.body.question).toBe('Updated Question');
    expect(response.body.body.answer).toBe('Updated Answer');
    expect(response.body.body.score).toBe(20);
  });

  it('should return 404 when updating non-existent assessment', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .put(`/api/bodytest/${fakeId}`)
      .send({ question: 'Updated' })
      .expect(404);

    expect(response.body.status).toBe('error');
  });
});

describe('DELETE /api/bodytest/:id - Delete Body Assessment', () => {
  it('should delete a body assessment successfully', async () => {
    const assessment = await BodyAssessment.create({
      question: 'To Delete',
      answer: 'Answer',
      type: 'mcq',
      score: 10,
      part: new mongoose.Types.ObjectId(),
      mcqOptions: []
    });

    const response = await request(app)
      .delete(`/api/bodytest/${assessment._id}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toContain('deleted');

    // Verify it's actually deleted
    const deleted = await BodyAssessment.findById(assessment._id);
    expect(deleted).toBeNull();
  });

  it('should return 404 when deleting non-existent assessment', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/bodytest/${fakeId}`)
      .expect(404);

    expect(response.body.status).toBe('error');
  });
});

describe('POST /api/bodytest/take - Take Body Assessment', () => {
  it('should submit assessment answers successfully', async () => {
    const assessment = await BodyAssessment.create({
      question: 'How do you feel?',
      answer: 'Joyful',
      type: 'mcq',
      score: 10,
      part: new mongoose.Types.ObjectId(),
      mcqOptions: [
        {
          text: 'Joyful',
          color: '#FFC107',
          emotionHierarchy: {
            primary: { id: 'joy', name: 'Joy', color: '#FFD700' },
            secondary: { id: 'content', name: 'Content', color: '#FFD700' },
            tertiary: { id: 'joyful', name: 'Joyful', color: '#FFC107' }
          }
        }
      ]
    });

    const submissionData = {
      assessmentId: assessment._id.toString(),
      answer: 'Joyful',
      patientId: new mongoose.Types.ObjectId().toString()
    };

    const response = await request(app)
      .post('/api/bodytest/take')
      .send(submissionData)
      .expect(200); // Adjust status code based on your implementation

    expect(response.body.status).toBe('success');
  });
});

describe('GET /api/questions/:partId - Get Questions by Part', () => {
  it('should get questions for a specific body part', async () => {
    const partId = new mongoose.Types.ObjectId();

    await BodyAssessment.create({
      question: 'Question 1',
      answer: 'Answer 1',
      type: 'mcq',
      score: 10,
      part: partId,
      mcqOptions: []
    });

    await BodyAssessment.create({
      question: 'Question 2',
      answer: 'Answer 2',
      type: 'mcq',
      score: 20,
      part: partId,
      mcqOptions: []
    });

    const response = await request(app)
      .get(`/api/questions/${partId}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.body)).toBe(true);
    expect(response.body.body.length).toBe(2);
  });

  it('should return empty array for part with no questions', async () => {
    const partId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/questions/${partId}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.body)).toBe(true);
    expect(response.body.body.length).toBe(0);
  });
});

