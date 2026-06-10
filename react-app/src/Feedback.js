import React, { useState, useEffect } from "react";
import { getFeedbacks, submitFeedback } from "./api";
import "./Feedback.css";

function Feedback({ displayName }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllFeedbacks = async () => {
    try {
      const data = await getFeedbacks();
      setFeedbacks(data || []);
    } catch (err) {
      console.error(err);
      setError("Could not load feedbacks. Please try again later.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const newFeedback = await submitFeedback({
        userName: displayName || "Anonymous User",
        content: content.trim()
      });
      // Add the new feedback to the top of the list
      setFeedbacks([newFeedback, ...feedbacks]);
      setContent("");
    } catch (err) {
      console.error(err);
      setError("Failed to submit feedback. Ensure backend is running and up to date.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h2 className="feedback-title">Community Feedback</h2>
        <p className="feedback-subtitle">Share your thoughts, suggestions, or feature requests with the community.</p>
      </div>

      <div className="feedback-form-card">
        <form onSubmit={handleSubmit}>
          {error && <div className="feedback-error">{error}</div>}
          
          <div className="feedback-input-group">
            <label className="feedback-label">Posting as</label>
            <input 
              type="text" 
              className="feedback-input" 
              value={displayName || "Anonymous User"} 
              disabled 
            />
          </div>

          <div className="feedback-input-group">
            <label className="feedback-label">Your Feedback</label>
            <textarea
              className="feedback-textarea"
              placeholder="What do you think about JobFlow AI? Any new features you want?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="feedback-submit-btn" 
            disabled={loading || !content.trim()}
          >
            {loading ? "Submitting..." : (
              <>
                <span className="material-symbols-outlined">send</span>
                Post Feedback
              </>
            )}
          </button>
        </form>
      </div>

      <div className="feedback-list">
        {initialLoading ? (
          <div className="feedback-loading">Loading feedbacks...</div>
        ) : feedbacks.length > 0 ? (
          feedbacks.map((fb) => (
            <div className="feedback-card" key={fb.id}>
              <div className="feedback-card-header">
                <div className="feedback-user-info">
                  <div className="feedback-avatar">
                    {(fb.userName || "A")[0].toUpperCase()}
                  </div>
                  <div className="feedback-username">{fb.userName}</div>
                </div>
                <div className="feedback-date">
                  {new Date(fb.createdAt).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="feedback-content">{fb.content}</div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ marginTop: "2rem" }}>
            <span className="material-symbols-outlined">forum</span>
            <p>No feedback yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;
