import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, BookOpen, MessageSquare, Repeat, Award, Activity } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Activity },
    { label: 'Skill Setup', path: '/setup', icon: Compass },
    { label: 'Roadmap', path: '/roadmap', icon: BookOpen },
    { label: 'Doubt Solver (RAG)', path: '/doubts', icon: MessageSquare },
    { label: 'Revision', path: '/revision', icon: Repeat },
    { label: 'AI Interview', path: '/interview', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              SkillPath AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
              PR-1 Prototype
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">Team Major Project</p>
            <p className="text-xs font-semibold text-sky-400">CSE Dept</p>
          </div>
        </div>
      </div>
    </header>
  );
};
