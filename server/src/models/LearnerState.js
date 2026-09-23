import mongoose from 'mongoose';

const topicMasterySchema = new mongoose.Schema(
  {
    topicId: { type: String, required: true },
    topicName: { type: String, required: true },
    masteryScore: { type: Number, min: 0, max: 100, default: 0 },
    confidenceScore: { type: Number, min: 0, max: 1, default: 0.5 },
    doubtCount: { type: Number, default: 0 },
    incorrectAnswersCount: { type: Number, default: 0 },
    correctAnswersCount: { type: Number, default: 0 },
    lastPracticedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['unexplored', 'learning', 'proficient', 'mastered', 'weak'],
      default: 'unexplored',
    },
  },
  { _id: false }
);

const learnerStateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetSkill: {
      type: String,
      required: true,
      index: true,
    },
    currentRoadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
    },
    overallCompetencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 20,
    },
    topicMasteries: [topicMasterySchema],
    weakTopics: [
      {
        topicId: String,
        topicName: String,
        reason: String,
        detectedAt: { type: Date, default: Date.now },
      },
    ],
    interviewReadinessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 15,
    },
    totalDoubtsAsked: { type: Number, default: 0 },
    totalInterviewsCompleted: { type: Number, default: 0 },
    totalRevisionSessions: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

learnerStateSchema.index({ userId: 1, targetSkill: 1 }, { unique: true });

export const LearnerState = mongoose.model('LearnerState', learnerStateSchema);
