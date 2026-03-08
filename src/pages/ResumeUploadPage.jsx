import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUp, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import UploadCard from '../components/UploadCard';
import SkillBadge from '../components/SkillBadge';
import { resumeService } from '../services/api';
import { geminiService } from '../services/geminiService';

const ResumeUploadPage = () => {
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError('');
    setSuccess(false);
    setExtractedText('');
    setExtractedSkills([]);
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // 1. Upload and extract text on server
      const response = await resumeService.upload(formData);
      const text = response.data.extractedText;
      setExtractedText(text);

      if (!text || text.trim().length < 10) {
        throw new Error('Could not extract enough text from the resume. Please try a different file.');
      }

      // 2. Extract skills using Gemini in frontend
      setIsExtracting(true);
      const skills = await geminiService.extractSkillsFromText(text);
      setExtractedSkills(skills);
      setSuccess(true);
      
      // Save skills to local storage
      localStorage.setItem('extractedSkills', JSON.stringify(skills));
    } catch (err) {
      console.error('Upload/Extraction error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process resume. Please try again.');
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
    }
  };

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

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black text-slate-900">Upload Resume</h1>
        <p className="text-slate-500">Extract skills from your resume to generate tailored questions.</p>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
        {!success ? (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Start by uploading your resume</h2>
              <p className="text-slate-500 leading-relaxed">
                We support PDF and DOCX formats. Our AI will analyze the text to identify 
                your technical expertise and soft skills.
              </p>
            </div>
            
            <UploadCard onUpload={handleUpload} isUploading={isUploading} />
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 max-w-2xl mx-auto"
              >
                <AlertCircle size={20} />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Skills Extracted Successfully!</h2>
              <p className="text-slate-500">We found {extractedSkills.length} skills in your resume.</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Identified Skills</h3>
                <form onSubmit={addManualSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add skill manually..."
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
                  >
                    Add
                  </button>
                </form>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {extractedSkills.map((skill) => (
                    <SkillBadge 
                      key={skill} 
                      skill={skill} 
                      onRemove={removeSkill}
                    />
                  ))}
                </AnimatePresence>
              </div>
              
              {extractedSkills.length === 0 && (
                <div className="space-y-4">
                  <p className="text-slate-400 italic">No skills were extracted. You can try another file or add them manually in the next step.</p>
                  {extractedText && (
                    <div className="mt-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Debug: Extracted Text</h4>
                      <pre className="text-[10px] text-slate-600 whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
                        {extractedText}
                      </pre>
                    </div>
                  )}
                  {!extractedText && (
                    <p className="text-red-400 text-xs">Warning: No text was extracted from the file. The file might be empty or an image-based PDF.</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setSuccess(false)}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                Upload Another
              </button>
              <Link
                to="/generate"
                className="w-full sm:w-auto px-8 py-4 gradient-bg text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Continue to Question Generator
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">AI-Powered Extraction</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Our advanced Gemini AI model reads through your experience, education, and projects 
            to find both explicit and implicit skills.
          </p>
        </div>
        <div className="bg-purple-50/50 p-8 rounded-[2rem] border border-purple-100">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
            <FileUp size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Privacy First</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Your resumes are processed securely and used only to extract skills for your 
            interview preparation session.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ResumeUploadPage;
