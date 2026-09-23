import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RoadmapService } from '../src/services/roadmap/roadmapService.js';
import { RoadmapGenerationZodSchema, RoadmapRequestZodSchema } from '../src/services/roadmap/roadmapSchema.js';

describe('Roadmap Service & Schema Validation Suite', () => {
  it('should validate valid user request input payload', () => {
    const validPayload = {
      targetSkill: 'Data Structures',
      currentLevel: 'Beginner',
      learningGoal: 'Campus Placements',
      availableTimeWeeks: 8,
      pace: 'Moderate',
    };

    const parsed = RoadmapRequestZodSchema.parse(validPayload);
    assert.strictEqual(parsed.targetSkill, 'Data Structures');
    assert.strictEqual(parsed.currentLevel, 'Beginner');
  });

  it('should reject invalid proficiency level', () => {
    const invalidPayload = {
      targetSkill: 'Data Structures',
      currentLevel: 'SuperExpert', // Invalid enum
      learningGoal: 'Campus Placements',
    };

    assert.throws(() => {
      RoadmapRequestZodSchema.parse(invalidPayload);
    });
  });

  it('should generate schema-compliant structured roadmap via RoadmapService', async () => {
    const input = {
      targetSkill: 'Operating Systems',
      currentLevel: 'Beginner',
      learningGoal: 'Placement Tech Rounds',
      availableTimeWeeks: 6,
      pace: 'Moderate',
    };

    const roadmap = await RoadmapService.generateRoadmap(input);
    assert.ok(roadmap);
    assert.strictEqual(roadmap.skill, 'Operating Systems');
    assert.ok(Array.isArray(roadmap.topics));
    assert.ok(roadmap.topics.length >= 2);

    // Assert that each topic has difficulty, prerequisites, and subtopics
    roadmap.topics.forEach((t) => {
      assert.ok(t.topicId);
      assert.ok(t.name);
      assert.ok(t.difficulty >= 1 && t.difficulty <= 5);
      assert.ok(Array.isArray(t.subtopics));
    });
  });
});
