import React from 'react';
import { Clock, Award, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

export const RoadmapCard = ({ topic, index }) => {
  const difficultyColors = {
    1: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    2: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    3: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    4: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    5: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const difficultyLabels = {
    1: 'Fundamental',
    2: 'Elementary',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Mastery',
  };

  return (
    <div className="relative glass-panel rounded-2xl p-6 border border-slate-800 hover:border-sky-500/40 transition-all duration-300">
      {/* Sequence Node Indicator */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-bold text-sm border border-sky-500/30">
            {index + 1}
          </span>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{topic.name}</h3>
            <span className="text-xs text-slate-400 font-mono">ID: {topic.topicId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
              difficultyColors[topic.difficulty] || difficultyColors[1]
            }`}
          >
            Level {topic.difficulty} • {difficultyLabels[topic.difficulty] || 'Standard'}
          </span>
          <span className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>{topic.estimatedHours} hrs</span>
          </span>
        </div>
      </div>

      {/* Prerequisites if any */}
      {topic.prerequisites && topic.prerequisites.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            Prerequisites:
          </span>
          {topic.prerequisites.map((preId) => (
            <span
              key={preId}
              className="text-[11px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 font-mono"
            >
              {preId}
            </span>
          ))}
        </div>
      )}

      {/* Learning Objectives */}
      {topic.learningObjectives && topic.learningObjectives.length > 0 && (
        <div className="mb-4 bg-slate-900/60 rounded-xl p-3 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Learning Objectives</p>
          <ul className="space-y-1.5">
            {topic.learningObjectives.map((obj, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nested Subtopics */}
      {topic.subtopics && topic.subtopics.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Core Subtopics</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topic.subtopics.map((sub, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
              >
                <div className="pr-2">
                  <p className="text-xs font-medium text-slate-200">{sub.title}</p>
                  {sub.description && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{sub.description}</p>}
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                  {sub.estimatedMinutes}m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
