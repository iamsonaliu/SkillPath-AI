import mongoose from 'mongoose';

const retrievedChunkSchema = new mongoose.Schema(
  {
    chunkId: String,
    documentTitle: String,
    content: String,
    score: Number,
    sourceUrl: String,
  },
  { _id: false }
);

const doubtSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topicId: { type: String, required: true },
    topicName: { type: String, required: true },
    query: { type: String, required: true },
    retrievedContexts: [retrievedChunkSchema],
    groundedAnswer: { type: String, required: true },
    sources: [{ type: String }],
    feedbackHelpful: { type: Boolean, default: null },
  },
  {
    timestamps: true,
  }
);

doubtSchema.index({ userId: 1, topicId: 1 });

export const Doubt = mongoose.model('Doubt', doubtSchema);
