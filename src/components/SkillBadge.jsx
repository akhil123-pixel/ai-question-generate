import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

const SkillBadge = ({ skill, onRemove }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100 text-sm font-medium"
    >
      {skill}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className="ml-2 p-0.5 hover:bg-primary-200 rounded-full transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
};

export default SkillBadge;
