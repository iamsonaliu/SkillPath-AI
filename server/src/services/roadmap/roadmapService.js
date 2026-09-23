import { Roadmap } from '../../models/Roadmap.js';
import { LearnerState } from '../../models/LearnerState.js';
import { llmProvider } from '../llm/llmProvider.js';
import { buildRoadmapPrompt } from '../llm/prompts.js';
import { RoadmapGenerationZodSchema } from './roadmapSchema.js';

export class RoadmapService {
  static getMockRoadmap(params) {
    const { targetSkill, currentLevel, learningGoal, availableTimeWeeks, pace } = params;
    return {
      skill: targetSkill,
      currentLevel,
      learningGoal,
      availableTimeWeeks: Number(availableTimeWeeks) || 8,
      pace,
      refinementNotes: `Optimized ${pace.toLowerCase()}-pace roadmap for ${targetSkill} targeting ${learningGoal}.`,
      topics: [
        {
          topicId: 't1',
          name: `${targetSkill} Core Foundations & Memory Model`,
          difficulty: 1,
          prerequisites: [],
          estimatedHours: 6,
          learningObjectives: [
            'Understand foundational memory layout and primitives',
            'Analyze basic time and space complexity models',
          ],
          subtopics: [
            { title: 'Foundational Syntax & Execution Lifecycle', description: 'Core building blocks and runtime memory', estimatedMinutes: 60 },
            { title: 'Asymptotic Analysis & Big-O Notation', description: 'Time vs. space complexity evaluation', estimatedMinutes: 90 },
          ],
        },
        {
          topicId: 't2',
          name: 'Linear Data Structures & Traversal Patterns',
          difficulty: 2,
          prerequisites: ['t1'],
          estimatedHours: 8,
          learningObjectives: [
            'Implement dynamic arrays and singly/doubly linked lists',
            'Master Two-Pointer and Sliding Window techniques',
          ],
          subtopics: [
            { title: 'Arrays, Strings & Slicing Internals', description: 'Contiguous memory access patterns', estimatedMinutes: 90 },
            { title: 'Pointers & Dynamic Node Linking', description: 'Reference management and node traversal', estimatedMinutes: 120 },
          ],
        },
        {
          topicId: 't3',
          name: 'Stacks, Queues & Monotonic Sequences',
          difficulty: 3,
          prerequisites: ['t2'],
          estimatedHours: 8,
          learningObjectives: [
            'Implement LIFO and FIFO abstractions',
            'Apply monotonic stack patterns to interview problems',
          ],
          subtopics: [
            { title: 'Evaluation of Expressions & Balanced Brackets', description: 'Using call stack mental models', estimatedMinutes: 90 },
            { title: 'Circular Queues & Deque Implementations', description: 'Buffer management and sliding window maximum', estimatedMinutes: 90 },
          ],
        },
        {
          topicId: 't4',
          name: 'Hierarchical Structures: Trees & Priority Queues',
          difficulty: 4,
          prerequisites: ['t2', 't3'],
          estimatedHours: 10,
          learningObjectives: [
            'Perform DFS and BFS tree traversals',
            'Construct binary search trees and heap structures',
          ],
          subtopics: [
            { title: 'Binary Tree Traversal (Inorder, Preorder, Postorder)', description: 'Recursive vs. iterative tree traversal', estimatedMinutes: 120 },
            { title: 'Binary Heap & Priority Queue Operations', description: 'Heapify, sift-up/down operations', estimatedMinutes: 120 },
          ],
        },
      ],
    };
  }

  static async generateRoadmap(inputData) {
    const prompt = buildRoadmapPrompt(inputData);

    // Call LLM with mock fallback
    const rawGeneratedData = await llmProvider.generateStructuredJSON(
      prompt,
      () => this.getMockRoadmap(inputData)
    );

    // Strict Schema Validation
    const validatedData = RoadmapGenerationZodSchema.parse(rawGeneratedData);

    // Persist to MongoDB (if DB connected)
    let savedRoadmap = null;
    try {
      const roadmapDoc = new Roadmap({
        userId: inputData.userId || null,
        skill: validatedData.skill,
        currentLevel: validatedData.currentLevel,
        learningGoal: validatedData.learningGoal,
        availableTimeWeeks: validatedData.availableTimeWeeks,
        pace: validatedData.pace,
        topics: validatedData.topics,
        refinementNotes: validatedData.refinementNotes,
      });

      savedRoadmap = await roadmapDoc.save();

      // Initialize or update Learner State if userId is present
      if (inputData.userId) {
        await LearnerState.findOneAndUpdate(
          { userId: inputData.userId, targetSkill: validatedData.skill },
          {
            $set: {
              currentRoadmapId: savedRoadmap._id,
              topicMasteries: validatedData.topics.map((t) => ({
                topicId: t.topicId,
                topicName: t.name,
                masteryScore: 10,
                confidenceScore: 0.3,
                status: 'unexplored',
              })),
              lastActiveAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      }
    } catch (dbErr) {
      console.warn(`[RoadmapService] DB save skipped or failed: ${dbErr.message}`);
      // Fallback: use generated object with virtual ID
      savedRoadmap = {
        ...validatedData,
        _id: 'virtual_' + Date.now(),
        createdAt: new Date().toISOString(),
      };
    }

    return savedRoadmap;
  }

  static async getRoadmapById(id) {
    try {
      const roadmap = await Roadmap.findById(id);
      return roadmap;
    } catch {
      return null;
    }
  }
}
