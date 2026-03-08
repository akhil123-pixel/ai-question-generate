import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, CheckCircle2, HelpCircle } from 'lucide-react';

const QuestionCard = ({ question, answer, keyPoints, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 cursor-pointer flex items-start justify-between gap-4"
      >
        <div className="flex gap-4">
          <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold">
            {index + 1}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 leading-tight">
              {question}
            </h3>
          </div>
        </div>
        <button className="mt-1 text-slate-400 hover:text-primary-500 transition-colors">
          {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-slate-50 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary-600 uppercase tracking-wider">
                  <HelpCircle size={16} />
                  <span>Suggested Answer</span>
                </div>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {answer}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 uppercase tracking-wider">
                  <CheckCircle2 size={16} />
                  <span>Key Points to Mention</span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionCard;
