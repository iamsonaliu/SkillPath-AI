import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { SkillSetup } from './pages/SkillSetup';
import { RoadmapView } from './pages/RoadmapView';
import { DoubtSolver } from './pages/DoubtSolver';
import { RevisionView } from './pages/RevisionView';
import { InterviewView } from './pages/InterviewView';

export function App() {
  const [currentRoadmap, setCurrentRoadmap] = useState(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Dashboard roadmap={currentRoadmap} />} />
            <Route
              path="/setup"
              element={<SkillSetup onRoadmapGenerated={(data) => setCurrentRoadmap(data)} />}
            />
            <Route path="/roadmap" element={<RoadmapView roadmap={currentRoadmap} />} />
            <Route path="/doubts" element={<DoubtSolver />} />
            <Route path="/revision" element={<RevisionView />} />
            <Route path="/interview" element={<InterviewView />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
          SkillPath AI • B.Tech CSE Major Project (Sonali Upadhyay, Krishna Choudhary, Kunal Singh Khati, Aditya Kapruwan)
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
