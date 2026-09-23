import mongoose from 'mongoose';

const subtopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
    estimatedMinutes: { type: Number, default: 45 },
  },
  { _id: true }
);

const topicSchema = new mongoose.Schema(
  {
    topicId: { type: String, required: true },
    name: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5, default: 1 },
    prerequisites: [{ type: String }],
    estimatedHours: { type: Number, default: 4 },
    learningObjectives: [{ type: String }],
    subtopics: [subtopicSchema],
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'needs-revision'],
      default: 'not-started',
    },
    masteryScore: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    skill: {
      type: String,
      required: [true, 'Skill is required'],
      trim: true,
    },
    currentLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    learningGoal: {
      type: String,
      required: true,
    },
    availableTimeWeeks: {
      type: Number,
      default: 8,
    },
    pace: {
      type: String,
      enum: ['Slow', 'Moderate', 'Intensive'],
      default: 'Moderate',
    },
    topics: [topicSchema],
    version: {
      type: Number,
      default: 1,
    },
    refinementNotes: {
      type: String,
      default: 'Initial AI-generated baseline roadmap',
    },
  },
  {
    timestamps: true,
  }
);

roadmapSchema.index({ userId: 1, skill: 1 });

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
