import mongoose from 'mongoose';

const rubricScoreSchema = new mongoose.Schema(
  {
    correctness: { type: Number, min: 0, max: 10, default: 0 },
    conceptualUnderstanding: { type: Number, min: 0, max: 10, default: 0 },
    depth: { type: Number, min: 0, max: 10, default: 0 },
    communication: { type: Number, min: 0, max: 10, default: 0 },
    confidence: { type: Number, min: 0, max: 10, default: 0 },
    overallScore: { type: Number, min: 0, max: 10, default: 0 },
    identifiedWeaknesses: [{ type: String }],
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const interviewExchangeSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    topicId: { type: String, required: true },
    topicName: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5, default: 2 },
    questionText: { type: String, required: true },
    expectedConcepts: [{ type: String }],
    userAnswerText: { type: String, default: '' },
    evaluation: rubricScoreSchema,
    answeredAt: { type: Date },
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetSkill: { type: String, required: true },
    roleTarget: { type: String, default: 'Software Engineer' },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    currentCompetencyEstimate: { type: Number, min: 0, max: 100, default: 30 },
    exchanges: [interviewExchangeSchema],
    finalSummary: {
      aggregateScore: { type: Number, min: 0, max: 100 },
      overallStrengths: [{ type: String }],
      primaryWeaknesses: [{ type: String }],
      recommendedActions: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

export const Interview = mongoose.model('Interview', interviewSchema);
