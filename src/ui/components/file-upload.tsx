import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({ onFileSelect, accept = '.txt,.pdf,.doc,.docx', label = 'Upload Resume' }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const content = await file.text();
    onFileSelect(file, content);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clear = () => {
    setFileName(null);
  };

  return (
    <div>
      {!fileName ? (
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer',
            dragOver
              ? 'border-hiremate-primary bg-hiremate-primary/10 shadow-glow'
              : 'border-white/10 hover:border-hiremate-primary/40 hover:bg-white/5',
          )}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-hiremate-primary/20 to-hiremate-secondary/20 flex items-center justify-center">
            <Upload className="w-8 h-8 text-hiremate-secondary" />
          </div>
          <p className="text-lg font-semibold text-hiremate-text mb-2">{label}</p>
          <p className="text-sm text-hiremate-muted">Drag & drop or click to browse</p>
          <p className="text-xs text-hiremate-muted/60 mt-2">Supports TXT, PDF, DOC, DOCX</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-hiremate-primary/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-hiremate-secondary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-hiremate-text">{fileName}</p>
            <p className="text-xs text-hiremate-muted">Ready for analysis</p>
          </div>
          <button onClick={clear} className="btn-ghost p-2">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
