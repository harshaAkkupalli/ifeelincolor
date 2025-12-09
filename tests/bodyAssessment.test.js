const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const BodyAssessment = require('../models/BodyAssessment');
const { expect, describe, it, beforeAll, afterAll, beforeEach } = require('@jest/globals');

// Fix for Node.js compatibility
if (typeof jest !== 'undefined') {
  jest.setTimeout(30000);
}

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await BodyAssessment.deleteMany({});
});

describe('BodyAssessment Model - Emotion Hierarchy', () => {
  it('should create assessment with emotion hierarchy', async () => {
    const assessmentData = {
      question: 'How does your shoulder feel?',
      answer: 'Joyful',
      type: 'mcq',
      score: 10,
      part: new mongoose.Types.ObjectId(),
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

    const assessment = await BodyAssessment.create(assessmentData);

    expect(assessment).toBeDefined();
    expect(assessment.mcqOptions[0].emotionHierarchy).toBeDefined();
    expect(assessment.mcqOptions[0].emotionHierarchy.primary.id).toBe('joy');
    expect(assessment.mcqOptions[0].emotionHierarchy.secondary.id).toBe('content');
    expect(assessment.mcqOptions[0].emotionHierarchy.tertiary.id).toBe('joyful');
  });

  it('should store multiple emotion options', async () => {
    const assessmentData = {
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
            tertiary: { id: 'joyful', name: 'Joyful', color: '#FFC107', description: 'Full of happiness' }
          }
        },
        {
          text: 'Courageous',
          color: '#FFA933',
          emotionHierarchy: {
            primary: { id: 'joy', name: 'Joy', color: '#FFD700' },
            secondary: { id: 'powerful', name: 'Powerful', color: '#FF9700' },
            tertiary: { id: 'courageous', name: 'Courageous', color: '#FFA933', description: 'Brave and fearless' }
          }
        }
      ]
    };

    const assessment = await BodyAssessment.create(assessmentData);

    expect(assessment.mcqOptions).toHaveLength(2);
    expect(assessment.mcqOptions[0].emotionHierarchy.tertiary.name).toBe('Joyful');
    expect(assessment.mcqOptions[1].emotionHierarchy.tertiary.name).toBe('Courageous');
  });

  it('should retrieve assessment with emotion hierarchy', async () => {
    const assessmentData = {
      question: 'Test question',
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
            tertiary: { id: 'joyful', name: 'Joyful', color: '#FFC107', description: 'Full of happiness' }
          }
        }
      ]
    };

    await BodyAssessment.create(assessmentData);
    const retrieved = await BodyAssessment.findOne({ question: 'Test question' });

    expect(retrieved).toBeDefined();
    expect(retrieved.mcqOptions[0].emotionHierarchy).toBeDefined();
    expect(retrieved.mcqOptions[0].emotionHierarchy.tertiary.name).toBe('Joyful');
  });
});

