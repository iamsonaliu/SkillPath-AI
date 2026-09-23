import React from 'react';
import { Award, Zap, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export const InterviewView = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Award className="w-3.5 h-3.5" />
          Module 4: Adaptive Multi-Turn AI Interview
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Adaptive Technical Interview Simulation</h1>
        <p className="mt-2 text-sm text-slate-400">
          Evaluates responses against a structured 5-dimensional rubric and dynamically routes the next question.
        </p>
      </div>

      <div className="glass-panel-glow rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">Current Question Difficulty</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">Level 3 / 5</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">Latent Competency Estimate</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">68 / 100</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">Target Role</p>
            <p className="text-xl font-bold text-purple-400 mt-1">Software Engineer</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">Question 3 of 6 (Dynamic)</span>
            <span className="text-sky-400">Probing Question Selected</span>
          </div>
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            "You previously described how hash tables achieve O(1) average lookup time. Can you explain what happens when collisions occur, compare Chaining vs. Open Addressing in terms of cache locality, and describe how Robin Hood hashing modifies insertion?"
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Adaptive Routing Principle:</p>
          <p>
            If the response demonstrates high correctness and depth (&gt;8.0/10), the engine routes to Level 4 system-level or amortized complexity questions. If the candidate struggles with basic collision mechanics, the engine shifts to Level 2 supportive foundational probing.
          </p>
        </div>
      </div>
    </div>
  );
};
