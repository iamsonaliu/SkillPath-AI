import React from 'react';
import { Link } from 'react-router-dom';
import { RoadmapCard } from '../components/RoadmapCard';
import { BookOpen, Layers, Clock, Zap, MessageSquare, Repeat, Award, ArrowRight } from 'lucide-react';

export const RoadmapView = ({ roadmap }) => {
  if (!roadmap) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-200">No Active Roadmap Found</h2>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          You haven't generated an adaptive roadmap yet. Configure your target skill to begin.
        </p>
        <Link
          to="/setup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all"
        >
          <span>Configure Skill Path</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const totalEstimatedHours = roadmap.topics?.reduce((acc, t) => acc + (t.estimatedHours || 0), 0) || 0;
  const totalSubtopics = roadmap.topics?.reduce((acc, t) => acc + (t.subtopics?.length || 0), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Info */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 mb-8 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold">
                {roadmap.currentLevel} Level
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold">
                {roadmap.pace} Pace
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 font-semibold">
                Version {roadmap.version || 1}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 sm:text-4xl">
              {roadmap.skill}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              <span className="font-semibold text-slate-300">Goal:</span> {roadmap.learningGoal}
            </p>
            {roadmap.refinementNotes && (
              <p className="text-xs text-sky-300/80 mt-2 italic bg-sky-950/40 p-2.5 rounded-lg border border-sky-900/50">
                "{roadmap.refinementNotes}"
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="glass-panel p-3 rounded-2xl text-center border border-slate-800">
              <div className="flex items-center justify-center text-sky-400 mb-1">
                <Layers className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-slate-100">{roadmap.topics?.length || 0}</p>
              <p className="text-[11px] text-slate-400">Core Topics</p>
            </div>

            <div className="glass-panel p-3 rounded-2xl text-center border border-slate-800">
              <div className="flex items-center justify-center text-indigo-400 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-slate-100">{totalEstimatedHours}</p>
              <p className="text-[11px] text-slate-400">Total Hours</p>
            </div>

            <div className="glass-panel p-3 rounded-2xl text-center border border-slate-800">
              <div className="flex items-center justify-center text-purple-400 mb-1">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-slate-100">{totalSubtopics}</p>
              <p className="text-[11px] text-slate-400">Subtopics</p>
            </div>
          </div>
        </div>

        {/* Closed-Loop Navigation Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Roadmap ID: <span className="font-mono text-slate-300">{roadmap._id || 'local-demo'}</span>
          </p>

          <div className="flex items-center gap-3">
            <Link
              to="/doubts"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Ask Doubts (RAG)</span>
            </Link>

            <Link
              to="/revision"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Repeat className="w-3.5 h-3.5 text-indigo-400" />
              <span>Revision</span>
            </Link>

            <Link
              to="/interview"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-sky-500/20 transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Take Adaptive Interview</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sequential Topic Graph / Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Structured Pedagogical Sequence</h2>
          <span className="text-xs text-slate-400">Prerequisite dependencies ordered strictly</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {roadmap.topics?.map((topic, index) => (
            <RoadmapCard key={topic.topicId || index} topic={topic} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};
