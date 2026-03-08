import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  FileUp, 
  Sparkles, 
  History, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  BrainCircuit
} from 'lucide-react';
import { historyService } from '../services/api';

const DashboardCard = ({ icon: Icon, title, description, link, color }) => (
  <Link to={link} className="group">
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 h-full flex flex-col">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 mb-6 flex-1 leading-relaxed">{description}</p>
      <div className="flex items-center gap-2 text-primary-600 font-bold group-hover:gap-3 transition-all">
        <span>Get Started</span>
        <ArrowRight size={18} />
      </div>
    </div>
  </Link>
);

const DashboardPage = ({ user }) => {
  const [recentHistory, setRecentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await historyService.getAll();
        setRecentHistory(response.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            {user?.isNewUser ? 'Welcome' : 'Welcome back'}, {user?.name}! 👋
          </h1>
          <p className="text-slate-500">Here's what's happening with your interview preparation.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold text-sm">
          <CheckCircle2 size={16} />
          <span>Account Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <DashboardCard
          icon={FileUp}
          title="Upload Resume"
          description="Upload your latest resume to extract skills and keep your profile up to date."
          link="/upload"
          color="bg-indigo-50 text-indigo-600"
        />
        <DashboardCard
          icon={Sparkles}
          title="Generate Questions"
          description="Create custom interview questions based on your skills and target role."
          link="/generate"
          color="bg-purple-50 text-purple-600"
        />
        <DashboardCard
          icon={History}
          title="View History"
          description="Review your previous interview sessions and track your preparation progress."
          link="/history"
          color="bg-pink-50 text-pink-600"
        />
      </div>

      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Clock size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
          </div>
          <Link to="/history" className="text-sm font-bold text-primary-600 hover:text-primary-700">View All</Link>
        </div>

        <div className="divide-y divide-slate-50">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading activity...</p>
            </div>
          ) : recentHistory.length > 0 ? (
            recentHistory.map((item) => (
              <Link 
                key={item._id} 
                to={`/history`} 
                className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Generated {item.questionCount} {item.questionType} Questions</p>
                    <p className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()} • {item.difficulty} Difficulty</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-primary-500 transition-colors" />
              </Link>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300">
                <History size={32} />
              </div>
              <p className="text-slate-500 font-medium">No recent activity yet.</p>
              <Link to="/upload" className="text-primary-600 font-bold text-sm mt-2 inline-block">Start by uploading your resume</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Helper component for the recent activity list
const ChevronRight = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default DashboardPage;
