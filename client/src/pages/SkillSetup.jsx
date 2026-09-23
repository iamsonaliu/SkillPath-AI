import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roadmapAPI } from '../services/api';
import { Sparkles, ArrowRight, Loader2, AlertCircle, Target, Clock, Zap } from 'lucide-react';

export const SkillSetup = ({ onRoadmapGenerated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    targetSkill: 'Data Structures & Algorithms',
    currentLevel: 'Beginner',
    learningGoal: 'Placement Preparation for Tech MNCs',
    availableTimeWeeks: 8,
    pace: 'Moderate',
    backgroundKnowledge: 'Basic C++ syntax and fundamental loops',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await roadmapAPI.generate({
        targetSkill: formData.targetSkill,
        currentLevel: formData.currentLevel,
        learningGoal: formData.learningGoal,
        availableTimeWeeks: Number(formData.availableTimeWeeks),
        pace: formData.pace,
        backgroundKnowledge: formData.backgroundKnowledge,
      });

      if (response.success && response.data) {
        onRoadmapGenerated(response.data);
        navigate('/roadmap');
      } else {
        throw new Error('Failed to generate roadmap data');
      }
    } catch (err) {
      console.error('Roadmap generation error:', err);
      setError(err.message || 'Error communicating with AI roadmap engine. Check backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Module 1: Personalized Roadmap Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 sm:text-4xl">
          Configure Your Target Skill Path
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter your current background and constraints. Our LLM curriculum engine will synthesize a structured,
          prerequisite-aware learning path with validated schema constraints.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-panel-glow rounded-3xl p-8 border border-slate-800">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Failed</p>
              <p className="text-xs text-rose-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Skill */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Target Skill or Domain <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.targetSkill}
              onChange={(e) => setFormData({ ...formData, targetSkill: e.target.value })}
              placeholder="e.g. Data Structures, React.js, System Design, Operating Systems"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Current Proficiency <span className="text-sky-400">*</span>
              </label>
              <select
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
              >
                <option value="Beginner">Beginner (Little to no prior mastery)</option>
                <option value="Intermediate">Intermediate (Familiar with syntax & fundamentals)</option>
                <option value="Advanced">Advanced (Looking for deep algorithmic rigor)</option>
              </select>
            </div>

            {/* Learning Pace */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Learning Pace <span className="text-sky-400">*</span>
              </label>
              <select
                value={formData.pace}
                onChange={(e) => setFormData({ ...formData, pace: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
              >
                <option value="Slow">Slow (Gentle progression, high reinforcement)</option>
                <option value="Moderate">Moderate (Standard university semester pace)</option>
                <option value="Intensive">Intensive (Fast-track placement bootcamp)</option>
              </select>
            </div>
          </div>

          {/* Learning Goal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Primary Learning Goal <span className="text-sky-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.learningGoal}
              onChange={(e) => setFormData({ ...formData, learningGoal: e.target.value })}
              placeholder="e.g. Placement interviews at Tier-1 product companies"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Horizon */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Time Horizon (Weeks)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={formData.availableTimeWeeks}
                  onChange={(e) => setFormData({ ...formData, availableTimeWeeks: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
                />
                <span className="absolute right-4 top-3 text-xs text-slate-400">weeks</span>
              </div>
            </div>

            {/* Prior Background */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Optional Background Knowledge
              </label>
              <input
                type="text"
                value={formData.backgroundKnowledge}
                onChange={(e) => setFormData({ ...formData, backgroundKnowledge: e.target.value })}
                placeholder="e.g. C++ syntax, basic linear search"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Synthesizing Schema-Validated Roadmap...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Closed-Loop Roadmap</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
