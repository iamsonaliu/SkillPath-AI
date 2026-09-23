import { z } from 'zod';

export const SubtopicZodSchema = z.object({
  title: z.string().min(2, 'Subtopic title must have at least 2 characters'),
  description: z.string().default(''),
  estimatedMinutes: z.number().int().positive().default(45),
});

export const TopicZodSchema = z.object({
  topicId: z.string().min(1, 'topicId is required'),
  name: z.string().min(2, 'Topic name is required'),
  difficulty: z.number().int().min(1).max(5).default(1),
  prerequisites: z.array(z.string()).default([]),
  estimatedHours: z.number().positive().default(4),
  learningObjectives: z.array(z.string()).min(1, 'At least one learning objective required'),
  subtopics: z.array(SubtopicZodSchema).min(1, 'At least one subtopic required'),
});

export const RoadmapGenerationZodSchema = z.object({
  skill: z.string().min(2, 'Skill name is required'),
  currentLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  learningGoal: z.string().min(3, 'Learning goal is required'),
  availableTimeWeeks: z.number().positive().default(8),
  pace: z.enum(['Slow', 'Moderate', 'Intensive']).default('Moderate'),
  topics: z.array(TopicZodSchema).min(2, 'Roadmap must have at least 2 structured topics'),
  refinementNotes: z.string().default('Initial personalized roadmap generation'),
});

export const RoadmapRequestZodSchema = z.object({
  userId: z.string().optional(),
  targetSkill: z.string().min(2, 'Target skill is required'),
  currentLevel: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    errorMap: () => ({ message: 'currentLevel must be Beginner, Intermediate, or Advanced' }),
  }),
  learningGoal: z.string().min(3, 'Learning goal is required'),
  availableTimeWeeks: z.number().min(1).max(52).default(8),
  pace: z.enum(['Slow', 'Moderate', 'Intensive']).default('Moderate'),
  backgroundKnowledge: z.string().optional(),
});
