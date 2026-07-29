"use client";

import { useEffect, useState } from "react";
import { NotebookText, Plus, Trash2, X } from "lucide-react";
import { getNotes, addNote, updateNote, deleteNote, type Note } from "@/lib/notes";

export default function NotebookClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  function openNewForm() {
    setEditingId(null);
    setTitle("");
    setBody("");
    setShowForm(true);
  }

  function openEditForm(note: Note) {
    setEditingId(note.id);
    setTitle(note.title);
    setBody(note.body);
    setShowForm(true);
  }

  function handleSave() {
    if (!title.trim()) return;
    const updated = editingId ? updateNote(editingId, title, body) : addNote(title, body);
    setNotes([...updated].sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1)));
    setShowForm(false);
  }

  function handleDelete(id: string) {
    setNotes(deleteNote(id).sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1)));
  }

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text">Notebook</h1>
          <p className="text-sm text-text-dim">Your saved notes.</p>
        </div>
        <button
          onClick={openNewForm}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent"
        >
          <Plus size={18} strokeWidth={2} className="text-white" />
        </button>
      </div>

      {showForm && (
        <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">
              {editingId ? "Edit Note" : "New Note"}
            </p>
            <button onClick={() => setShowForm(false)}>
              <X size={16} strokeWidth={1.5} className="text-text-dim" />
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="mt-3 w-full rounded-xl bg-surface-2 px-4 py-2.5 text-sm text-text placeholder:text-text-dim outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note..."
            rows={4}
            className="mt-2 w-full resize-none rounded-xl bg-surface-2 px-4 py-2.5 text-sm text-text placeholder:text-text-dim outline-none"
          />
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="mt-3 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save Note
          </button>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {notes.length === 0 && !showForm && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <NotebookText size={28} strokeWidth={1.5} className="text-text-dim" />
            <p className="text-sm text-text-dim">No notes yet. Tap + to add one.</p>
          </div>
        )}
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => openEditForm(note)}
            className="rounded-2xl border border-border bg-surface p-4 text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-text">{note.title}</p>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note.id);
                }}
                className="shrink-0 rounded-full p-1 text-text-dim hover:text-danger"
              >
                <Trash2 size={16} strokeWidth={1.5} />
              </span>
            </div>
            {note.body && <p className="mt-1.5 line-clamp-2 text-sm text-text-dim">{note.body}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
