import { useState, useEffect } from 'react';
import { getNotes } from '@/services/storage/indexed-db';
import type { StudyNote } from '@/types';

interface NotesPageProps {
  onBack: () => void;
}

export function NotesPage({ onBack }: NotesPageProps) {
  const [notes, setNotes] = useState<StudyNote[]>([]);

  useEffect(() => {
    getNotes().then(setNotes);
  }, []);

  return (
    <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-lg">←</button>
        <h2 className="text-lg font-bold">Study Notes 📚</h2>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="text-4xl">📝</div>
          <p className="text-sm text-gray-500">No notes yet. Generate notes from any article!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="card bg-white border border-gray-100">
              <div className="font-semibold text-sm text-gray-900">{note.title}</div>
              <div className="text-xs text-gray-500 mt-1">{note.type} • {new Date(note.createdAt).toLocaleDateString()}</div>
              <div className="text-xs text-gray-600 mt-2 line-clamp-3">{note.content.slice(0, 200)}...</div>
              <button
                onClick={() => navigator.clipboard.writeText(note.content)}
                className="mt-2 text-xs text-brand-600 font-medium hover:underline"
              >
                📋 Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
