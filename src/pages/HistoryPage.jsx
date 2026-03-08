import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Search, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  BarChart3,
  BrainCircuit,
  AlertCircle,
  X,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { historyService } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import Loader from '../components/Loader';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const exportToPDF = (session) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text('Interview Questions', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Difficulty: ${session.difficulty} | Type: ${session.questionType}`, 14, 30);
    doc.text(`Generated on: ${new Date(session.createdAt).toLocaleString()}`, 14, 35);
    
    // Skills
    if (session.extractedSkills && session.extractedSkills.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Skills Context:', 14, 45);
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(session.extractedSkills.join(', '), 14, 50);
    }

    let yPos = 60;

    session.questions.forEach((q, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229);
      doc.text(`Question ${index + 1}`, 14, yPos);
      yPos += 7;

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      const questionLines = doc.splitTextToSize(q.question, 180);
      doc.text(questionLines, 14, yPos);
      yPos += (questionLines.length * 6) + 5;

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.setFont(undefined, 'bold');
      doc.text('Suggested Answer:', 14, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 5;
      const answerLines = doc.splitTextToSize(q.answer, 180);
      doc.text(answerLines, 14, yPos);
      yPos += (answerLines.length * 5) + 8;

      doc.setFontSize(10);
      doc.setTextColor(5, 150, 105);
      doc.setFont(undefined, 'bold');
      doc.text('Key Points:', 14, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 5;
      q.key_points.forEach(point => {
        const pointLines = doc.splitTextToSize(`• ${point}`, 175);
        doc.text(pointLines, 18, yPos);
        yPos += (pointLines.length * 5);
      });
      
      yPos += 15;
    });

    doc.save(`Interview_Questions_${new Date(session.createdAt).getTime()}.pdf`);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await historyService.getAll();
      console.log('Fetched history items:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('Sample item structure:', response.data[0]);
      }
      setHistory(response.data);
    } catch (err) {
      setError('Failed to load your history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    // Aggressive debugging
    console.log('handleDelete called with ID:', id);
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!id && id !== 0) {
      alert('Error: No session ID found for this item.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this session?');
    if (!confirmed) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      console.log('Sending delete request for ID:', id);
      const response = await historyService.delete(id);
      console.log('Server response:', response);
      
      // Update local state immediately
      setHistory(prev => {
        const newHistory = prev.filter(item => {
          const itemId = String(item._id || item.id);
          const targetId = String(id);
          return itemId !== targetId;
        });
        return newHistory;
      });
      
      if (selectedSession && String(selectedSession._id || selectedSession.id) === String(id)) {
        setIsModalOpen(false);
        setSelectedSession(null);
      }
      
      alert('Session deleted successfully.');
    } catch (err) {
      console.error('Delete failed:', err);
      const errorMsg = err.response?.data?.message || err.message;
      alert(`Failed to delete session: ${errorMsg}`);
    }
  };

  const openSession = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Interview History</h1>
          <p className="text-slate-500">Review your past preparation sessions.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search sessions..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
      </header>

      {isLoading ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-20 flex flex-col items-center justify-center">
          <Loader />
          <p className="text-slate-400 mt-4">Fetching your history...</p>
        </div>
      ) : history.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <motion.div
              layout
              key={item._id || item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div 
                className="flex items-center gap-5 cursor-pointer flex-1"
                onClick={() => openSession(item)}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BrainCircuit size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                    {item.questionCount} {item.questionType} Questions
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BarChart3 size={14} />
                      {item.difficulty} Difficulty
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-1 max-w-[200px] justify-end hidden md:flex">
                  {item.extractedSkills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-50 text-[10px] font-bold text-slate-400 rounded uppercase border border-slate-100">
                      {skill}
                    </span>
                  ))}
                  {item.extractedSkills.length > 3 && (
                    <span className="px-2 py-0.5 bg-slate-50 text-[10px] font-bold text-slate-400 rounded uppercase border border-slate-100">
                      +{item.extractedSkills.length - 3}
                    </span>
                  )}
                </div>
                <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openSession(item);
                  }}
                  className="p-4 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all active:scale-95"
                  title="View Details"
                >
                  <ExternalLink size={24} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
            <History size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No history found</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            You haven't generated any interview questions yet. Start your first session now!
          </p>
          <button className="mt-8 px-8 py-4 gradient-bg text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">
            Start Preparation
          </button>
        </div>
      )}

      {/* Session Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-slate-50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {selectedSession.questionCount} {selectedSession.questionType} Questions
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Generated on {new Date(selectedSession.createdAt).toLocaleString()} • {selectedSession.difficulty} Difficulty
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportToPDF(selectedSession)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 hover:text-primary-600 rounded-xl text-sm font-bold transition-all"
                  >
                    <Download size={18} />
                    Export PDF
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Skills Context</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSession.extractedSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold border border-primary-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedSession.questions.map((q, index) => (
                    <QuestionCard
                      key={index}
                      index={index}
                      question={q.question}
                      answer={q.answer}
                      keyPoints={q.key_points}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryPage;
