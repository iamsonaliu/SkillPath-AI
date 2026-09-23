import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { healthAPI } from '../services/api';
import {
  Compass,
  BookOpen,
  MessageSquare,
  Repeat,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Layers,
  ArrowRight,
  Database,
  Cpu,
} from 'lucide-react';

export const Dashboard = ({ roadmap }) => {
  const [health, setHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  useEffect(() => {
    healthAPI
      .check()
      .then((data) => {
        setHealth(data);
        setCheckingHealth(false);
      })
      .catch((err) => {
        console.warn('Backend health check error:', err);
        setHealth({ status: 'unreachable', database: 'disconnected', llmProvider: 'offline' });
        setCheckingHealth(false);
      });
  }, []);

  const modules = [
    {
      id: 'm1',
      title: '1. Roadmap Generation',
      desc: 'LLM synthesizes structured, prerequisite-aware curriculum JSON validated against Zod schemas.',
      status: 'Active (PR-1 Slice)',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: Compass,
      link: '/setup',
      actionText: 'Generate Roadmap',
    },
    {
      id: 'm2',
      title: '2. RAG Doubt Solver',
      desc: 'Retrieves relevant document chunks from vector index and returns grounded answers with sources.',
      status: 'In Progress (PR-1 Target)',
      statusColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      icon: MessageSquare,
      link: '/doubts',
      actionText: 'Explore Doubt Solver',
    },
    {
      id: 'm3',
      title: '3. Personalized Revision',
      desc: 'Aggregates learning gaps and doubts to generate targeted practice questions and explanations.',
      status: 'Post PR-1',
      statusColor: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: Repeat,
      link: '/revision',
      actionText: 'View Revision Specs',
    },
    {
      id: 'm4',
      title: '4. Adaptive AI Interview',
      desc: 'Multi-turn conversational mock interview dynamically adjusting difficulty based on response rubrics.',
      status: 'Post PR-1',
      statusColor: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: Award,
      link: '/interview',
      actionText: 'View Interview Specs',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="glass-panel-glow rounded-3xl p-8 sm:p-10 mb-8 border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-4">
            B.Tech CSE Major Project • Team Sonali, Krishna, Kunal & Aditya
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
            SkillPath AI
          </h1>
          <p className="mt-3 text-lg text-slate-300 font-medium">
            An Adaptive Skill Learning and Interview Readiness Platform
          </p>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-2xl">
            Overcoming fragmented student preparation through a unified, closed-loop learner state that ties
            curriculum roadmaps, vector-grounded doubt resolution, weakness-targeted revision, and adaptive interview simulations into a single continuous feedback loop.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <Link
              to="/setup"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Configure Target Skill</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {roadmap && (
              <Link
                to="/roadmap"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>View Current Roadmap ({roadmap.skill})</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Backend & DB Health Indicator */}
      <div className="glass-panel rounded-2xl p-4 mb-8 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">System Runtime Status</p>
            <p className="text-[11px] text-slate-400">
              Backend Service: {checkingHealth ? 'Checking...' : health?.status === 'healthy' ? 'Online (Port 5000)' : 'Offline/Mock'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>DB: {health?.database || 'Pending'}</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>LLM: {health?.llmProvider || 'mock'}</span>
          </span>
        </div>
      </div>

      {/* The Closed-Loop Flow Concept */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Repeat className="w-5 h-5 text-sky-400" />
          <span>The Closed-Loop Feedback Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-sky-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${m.statusColor}`}>
                      {m.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-200 text-sm">{m.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{m.desc}</p>
                </div>

                <Link
                  to={m.link}
                  className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center justify-between"
                >
                  <span>{m.actionText}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
