export const buildRoadmapPrompt = ({
  targetSkill,
  currentLevel,
  learningGoal,
  availableTimeWeeks,
  pace,
  backgroundKnowledge,
}) => {
  return `You are a Senior Computer Science Curriculum Architect and AI Mentor.
Design an expert, academically rigorous, personalized learning roadmap for a student.

STUDENT PROFILE:
- Target Skill: ${targetSkill}
- Current Proficiency Level: ${currentLevel}
- Target Goal: ${learningGoal}
- Time Horizon: ${availableTimeWeeks} weeks
- Preferred Learning Pace: ${pace}
- Prior Background Knowledge: ${backgroundKnowledge || 'None specified'}

CRITICAL OUTPUT REQUIREMENTS:
1. Output ONLY valid, parsable JSON with NO markdown code fences (no \`\`\`json, no backticks).
2. The JSON must strictly adhere to the following schema:
{
  "skill": "${targetSkill}",
  "currentLevel": "${currentLevel}",
  "learningGoal": "${learningGoal}",
  "availableTimeWeeks": ${availableTimeWeeks},
  "pace": "${pace}",
  "refinementNotes": "Detailed summary of how this roadmap matches the student's constraints",
  "topics": [
    {
      "topicId": "t1",
      "name": "Topic Name",
      "difficulty": 1,
      "prerequisites": [],
      "estimatedHours": 4,
      "learningObjectives": ["Objective 1", "Objective 2"],
      "subtopics": [
        {
          "title": "Subtopic Title",
          "description": "Short explanation of the core concept",
          "estimatedMinutes": 45
        }
      ]
    }
  ]
}

3. Order topics in strict pedagogical dependency sequence (prerequisites first).
4. Difficulty must be an integer from 1 (fundamental) to 5 (advanced).
5. Generate between 4 and 8 comprehensive topics tailored to the allocated weeks.`;
};
