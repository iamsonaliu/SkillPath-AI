import React, { useState } from 'react';
import { MessageSquare, Send, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export const DoubtSolver = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your RAG-powered Doubt Solving Mentor for SkillPath AI. Ask any conceptual or algorithmic doubt grounded in our technical index.',
      sources: ['CS Core Knowledge Base v1.0'],
    },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQ = query;
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userQ },
      {
        sender: 'assistant',
        text: `[RAG Grounded Response Simulation for "${userQ}"]: In technical preparation, concepts must be analyzed using rigorous invariant definitions, asymptotic bounds, and memory layout considerations. Our vector pipeline retrieves top-k chunks from the document corpus to construct high-density context for the LLM.`,
        sources: ['Module 2 Document Corpus: Data Structures & Algorithms', 'Chunk ID: dsa-chunk-402'],
      },
    ]);
    setQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <MessageSquare className="w-3.5 h-3.5" />
          Module 2: RAG-Based Learning & Doubt Solving
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">AI Conceptual Doubt Solver</h1>
        <p className="mt-2 text-sm text-slate-400">
          Grounded technical assistance using vector embeddings (all-MiniLM-L6-v2) and chunked corpus retrieval.
        </p>
      </div>

      <div className="glass-panel-glow rounded-3xl p-6 border border-slate-800 flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                  m.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                {m.sources && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap text-[11px] text-sky-400">
                    <BookOpen className="w-3 h-3" />
                    <span>Sources: {m.sources.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a technical doubt (e.g. 'Why is quicksort O(n^2) in worst case and how does randomized pivot fix it?')"
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm flex items-center gap-2 transition-all"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
