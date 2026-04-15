import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JobNotes.css';

function JobNotes({ jobId, showNotes, onClose }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [loading, setLoading] = useState(false);

  const API_URL = `${process.env.REACT_APP_API_URL.replace('/api', '')}/jobs/notes`;

  useEffect(() => {
    if (showNotes && jobId) {
      fetchNotes();
    }
  }, [showNotes, jobId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/job/${jobId}`);
      setNotes(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const noteData = {
        jobId,
        noteContent: newNote,
        noteType
      };
      await axios.post(API_URL, noteData);
      setNewNote('');
      setNoteType('general');
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
    <div className="notes-modal-overlay" onClick={onClose}>
      <div className="notes-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notes-header">
          <h3>📝 Job Notes</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="notes-content">
          {/* Add Note Section */}
          <div className="add-note-section">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note... (Interview feedback, follow-up tasks, etc.)"
              className="note-textarea"
            />
            <div className="note-controls">
              <select value={noteType} onChange={(e) => setNoteType(e.target.value)} className="note-type-select">
                <option value="general">General Note</option>
                <option value="interview">Interview Notes</option>
                <option value="feedback">Feedback</option>
                <option value="followup">Follow-up</option>
              </select>
              <button onClick={addNote} className="add-note-btn">Add Note</button>
            </div>
          </div>

          {/* Notes List */}
          <div className="notes-list">
            {loading ? (
              <p className="loading">Loading notes...</p>
            ) : notes.length > 0 ? (
              notes.map((note) => (
                <div key={note.id} className="note-item">
                  <div className="note-header">
                    <span className={`note-badge ${note.noteType}`}>{note.noteType}</span>
                    <span className="note-date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                      className="delete-note-btn"
                      onClick={() => deleteNote(note.id)}
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="note-content">{note.noteContent}</p>
                </div>
              ))
            ) : (
              <p className="no-notes">No notes yet. Add your first note!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobNotes;
