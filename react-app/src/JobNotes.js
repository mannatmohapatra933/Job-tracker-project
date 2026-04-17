import React, { useState, useEffect } from "react";
import axios from "axios";
import "./JobNotes.css";

function JobNotes({ jobId, showNotes, onClose }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [loading, setLoading] = useState(false);

  const API_URL = `${(process.env.REACT_APP_API_URL || "").replace("/api", "")}/jobs/notes`;

  useEffect(() => {
    if (showNotes && jobId) fetchNotes();
    // eslint-disable-next-line
  }, [showNotes, jobId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/job/${jobId}`);
      setNotes(res.data || []);
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      await axios.post(API_URL, { jobId, noteContent: newNote, noteType });
      setNewNote("");
      setNoteType("general");
      fetchNotes();
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await axios.delete(`${API_URL}/${noteId}`);
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  if (!showNotes) return null;

  return (
    <div className="notes-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="notes-card">
        <div className="notes-header">
          <span className="notes-title">
            <span className="material-symbols-outlined">edit_note</span>
            Job Notes
          </span>
          <button className="notes-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Add Note */}
        <div className="notes-input-area">
          <textarea
            className="notes-textarea"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note... (interview feedback, follow-up tasks, etc.)"
            onKeyDown={(e) => e.ctrlKey && e.key === "Enter" && addNote()}
          />
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              style={{
                background: "var(--surface-container-lowest)",
                border: "1px solid rgba(73,69,82,0.3)",
                color: "var(--on-surface)",
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--radius)",
                fontSize: "0.8125rem",
                outline: "none",
                cursor: "pointer",
                fontFamily: "var(--font)",
              }}
            >
              <option value="general">General</option>
              <option value="interview">Interview</option>
              <option value="feedback">Feedback</option>
              <option value="followup">Follow-up</option>
            </select>
            <button className="notes-add-btn" onClick={addNote}>
              Add Note
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="notes-list">
          {loading ? (
            <p className="notes-loading">Loading notes...</p>
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="note-item">
                <p className="note-item-text">{note.noteContent}</p>
                <div className="note-item-footer">
                  <span className="note-item-date">
                    {note.noteType} &bull;{" "}
                    {new Date(note.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <button className="note-delete-btn" onClick={() => deleteNote(note.id)}>
                    <span className="material-symbols-outlined">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="notes-empty">No notes yet. Add your first note above!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobNotes;
