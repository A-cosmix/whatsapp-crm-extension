import { useState } from 'react';
import { Plus, Pin, Trash2, StickyNote } from 'lucide-react';
import { MessageTypes, sendMessage } from '../lib/messages';
import type { Note } from '../types';

interface NotesWidgetProps {
  notes: Note[];
  expanded?: boolean;
}

export function NotesWidget({ notes, expanded = false }: NotesWidgetProps) {
  const [selected, setSelected] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });

  const createNote = async () => {
    await sendMessage(MessageTypes.ADD_NOTE, { title: 'New Note', content: '' });
  };

  const saveNote = async () => {
    if (!selected) return;
    await sendMessage(MessageTypes.UPDATE_NOTE, {
      ...selected,
      title: title || 'Untitled',
      content,
    });
    setSelected(null);
  };

  const deleteNote = async (id: string) => {
    await sendMessage(MessageTypes.DELETE_NOTE, { id });
    if (selected?.id === id) setSelected(null);
  };

  const openNote = (note: Note) => {
    setSelected(note);
    setTitle(note.title);
    setContent(note.content);
  };

  if (selected && expanded) {
    return (
      <div className="mx-card h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <button type="button" onClick={() => setSelected(null)} className="text-xs opacity-50 hover:opacity-80">
            ← Back
          </button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mx-input mb-2 font-medium"
          placeholder="Note title"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mx-input flex-1 resize-none min-h-[200px]"
          placeholder="Start writing..."
        />
        <button type="button" onClick={saveNote} className="mx-btn-primary mt-3">Save Note</button>
      </div>
    );
  }

  return (
    <div className="mx-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote size={16} style={{ color: 'var(--mx-accent)' }} />
          <p className="text-sm font-medium">Smart Notes</p>
        </div>
        <button type="button" onClick={createNote} className="mx-btn-ghost px-2 py-1.5">
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {sorted.slice(0, expanded ? undefined : 5).map((note) => (
          <div
            key={note.id}
            className="group mx-glass rounded-xl p-3 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => expanded && openNote(note)}
            onKeyDown={(e) => e.key === 'Enter' && expanded && openNote(note)}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {note.pinned && <Pin size={10} className="opacity-50" />}
                  <p className="text-sm font-medium truncate">{note.title}</p>
                </div>
                <p className="text-xs opacity-40 truncate mt-0.5">{note.content || 'Empty note'}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                className="opacity-0 group-hover:opacity-40 p-1"
                aria-label="Delete note"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-xs opacity-40 text-center py-4">No notes yet</p>
        )}
      </div>
    </div>
  );
}
