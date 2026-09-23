import React from 'react';
import { Repeat, CheckCircle2, AlertTriangle, BookOpen, Layers } from 'lucide-react';

export const RevisionView = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Repeat className="w-3.5 h-3.5" />
          Module 3: Weakness-Conditioned Revision
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">Personalized Revision Engine</h1>
        <p className="mt-2 text-sm text-slate-400">
          Targeted micro-assessments and remediation synthesized from recorded doubt queries and interview misconceptions.
        </p>
      </div>

      <div className="glass-panel-glow rounded-3xl p-8 border border-slate-800 space-y-6">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-200">Weak Area Flagged: Sliding Window Dynamic Boundary Invariants</h4>
            <p className="text-xs text-amber-300/80 mt-1">
              Triggered by 2 repeated doubt inquiries and suboptimal evaluation in interview mock.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-200">Synthesized Targeted Practice Task</h3>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-sky-400">Problem Statement:</p>
            <p>
              Given a binary array nums and an integer k, return the maximum number of consecutive 1's in the array if you can flip at most k 0's.
            </p>
            <p className="font-semibold text-slate-400 pt-2">Focus Invariant:</p>
            <p>
              Maintain a valid window [left, right] where the count of zero elements is at most k. When zeros exceed k, increment left while adjusting state.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
