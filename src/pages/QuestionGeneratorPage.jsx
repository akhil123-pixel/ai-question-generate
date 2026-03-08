import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Settings2, ListOrdered, BrainCircuit, AlertCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { geminiService } from '../services/geminiService';
import { questionService } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import SkillBadge from '../components/SkillBadge';
import Loader from '../components/Loader';

const QuestionGeneratorPage = () => {
  // ... existing state ...

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Interview Questions', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Difficulty: ${difficulty} | Type: ${questionType}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);
    
    // Skills
    if (extractedSkills.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Skills Context:', 14, 45);
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(extractedSkills.join(', '), 14, 50);
    }

    let yPos = 60;

    questions.forEach((q, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229); // primary-600
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
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.setFont(undefined, 'bold');
      doc.text('Key Points:', 14, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 5;
      q.key_points.forEach(point => {
        const pointLines = doc.splitTextToSize(`• ${point}`, 175);
        doc.text(pointLines, 18, yPos);
        yPos += (pointLines.length * 5);
      });
      
      yPos += 15; // Space between questions
    });

    doc.save(`Interview_Questions_${new Date().getTime()}.pdf`);
  };
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('Technical');
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedSkills = localStorage.getItem('extractedSkills');
    if (savedSkills) {
      setExtractedSkills(JSON.parse(savedSkills));
    }
  }, []);

  const addManualSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !extractedSkills.includes(newSkill.trim())) {
      const updatedSkills = [...extractedSkills, newSkill.trim()];
      setExtractedSkills(updatedSkills);
      setNewSkill('');
      localStorage.setItem('extractedSkills', JSON.stringify(updatedSkills));
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = extractedSkills.filter(s => s !== skillToRemove);
    setExtractedSkills(updatedSkills);
    localStorage.setItem('extractedSkills', JSON.stringify(updatedSkills));
  };

  const handleGenerate = async () => {
    if (extractedSkills.length === 0) {
      setError('Please upload a resume first or add some skills.');
      return;
    }

    setIsLoading(true);
    setError('');
    setQuestions([]);

    try {
      const generatedQuestions = await geminiService.generateInterviewQuestions(
        extractedSkills,
        difficulty,
        questionType,
        parseInt(questionCount)
      );
      setQuestions(generatedQuestions);

      // Save to history in background
      try {
        await questionService.save({
          extractedSkills,
          difficulty,
          questionType,
          questionCount: parseInt(questionCount),
          questions: generatedQuestions
        });
      } catch (saveErr) {
        console.error('Failed to save history:', saveErr);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black text-slate-900">Generate Questions</h1>
        <p className="text-slate-500">Customize your interview session based on your skills.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-8">
            <div className="flex items-center gap-3 text-slate-800">
              <Settings2 size={24} className="text-primary-500" />
              <h2 className="text-xl font-bold">Configuration</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-slate-400" />
                    Skills Context
                  </div>
                  {extractedSkills.length > 0 && (
                    <button 
                      onClick={() => {
                        setExtractedSkills([]);
                        localStorage.setItem('extractedSkills', JSON.stringify([]));
                      }}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </label>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px]">
                    <div className="flex flex-wrap gap-2">
                      {extractedSkills.length > 0 ? (
                        extractedSkills.map((skill) => (
                          <span 
                            key={skill} 
                            className="group px-2 py-1 bg-white rounded-lg text-xs font-bold text-slate-600 border border-slate-200 flex items-center gap-1"
                          >
                            {skill}
                            <button 
                              onClick={() => removeSkill(skill)}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No skills found. Please upload a resume or add them below.</p>
                      )}
                    </div>
                  </div>
                  <form onSubmit={addManualSkill} className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add skill..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
                    >
                      Add
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                        difficulty === level 
                          ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-100' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-primary-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Question Type</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-medium text-slate-700"
                >
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Soft skill">Soft Skill</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex justify-between">
                  <span>Number of Questions</span>
                  <span className="text-primary-600">{questionCount}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || extractedSkills.length === 0}
              className="w-full py-4 gradient-bg text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Questions
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-20 flex flex-col items-center justify-center text-center"
              >
                <Loader />
                <h3 className="text-xl font-bold text-slate-800 mt-6">Crafting your interview...</h3>
                <p className="text-slate-500 mt-2">Our AI is analyzing your skills to create the perfect questions.</p>
              </motion.div>
            ) : questions.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-800">
                    <ListOrdered size={24} className="text-primary-500" />
                    <h2 className="text-xl font-bold">Generated Questions</h2>
                  </div>
                  <button 
                    onClick={exportToPDF}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors"
                  >
                    <Download size={18} />
                    Export PDF
                  </button>
                </div>
                
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <QuestionCard
                      key={index}
                      index={index}
                      question={q.question}
                      answer={q.answer}
                      keyPoints={q.key_points}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-20 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                  <Sparkles size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No questions generated yet</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Configure your session and click generate to see AI-powered interview questions.
                </p>
                {error && (
                  <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default QuestionGeneratorPage;
