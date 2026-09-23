import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: '',
    },
    targetRole: {
      type: String,
      default: 'Software Engineer',
    },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    preferences: {
      dailyHours: { type: Number, default: 2 },
      learningPace: {
        type: String,
        enum: ['Slow', 'Moderate', 'Intensive'],
        default: 'Moderate',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
