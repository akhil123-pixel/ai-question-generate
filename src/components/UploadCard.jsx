import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const UploadCard = ({ onUpload, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          "relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center",
          isDragging 
            ? "border-primary-500 bg-primary-50/50" 
            : "border-slate-200 hover:border-primary-400 hover:bg-slate-50"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx"
          className="hidden"
        />

        <div className={clsx(
          "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110",
          file ? "bg-emerald-100 text-emerald-600" : "bg-primary-100 text-primary-600"
        )}>
          {file ? <CheckCircle size={40} /> : <Upload size={40} />}
        </div>

        {file ? (
          <div className="space-y-2">
            <p className="text-xl font-bold text-slate-800">{file.name}</p>
            <p className="text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xl font-bold text-slate-800">Click or drag resume here</p>
            <p className="text-slate-500">Support PDF and DOCX files (Max 10MB)</p>
          </div>
        )}
      </div>

      {file && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Extracting Skills...
              </>
            ) : (
              <>
                <FileText size={20} />
                Extract Skills from Resume
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default UploadCard;
