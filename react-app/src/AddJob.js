import React, { useState } from "react";
import "./AddJob.css";

const AddJob = ({ onJobAdded, onClose }) => {
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "Applied",
    salary: "",
    experienceLevel: "",
    location: "",
    applicationLink: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newJob = await response.json();
        onJobAdded(newJob);
      } else {
        setError("Failed to add job. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Error adding job:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <span className="modal-title">Add New Job</span>
          <button className="modal-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && <div className="modal-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-grid">
            <div className="modal-field">
              <label className="modal-label">Company *</label>
              <input
                className="modal-input"
                type="text"
                name="company"
                placeholder="e.g. Google"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Role *</label>
              <input
                className="modal-input"
                type="text"
                name="role"
                placeholder="e.g. Frontend Engineer"
                value={formData.role}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-grid">
            <div className="modal-field">
              <label className="modal-label">Status</label>
              <select className="modal-select" name="status" value={formData.status} onChange={handleChange}>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Interview">Interview</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="modal-field">
              <label className="modal-label">Location</label>
              <input
                className="modal-input"
                type="text"
                name="location"
                placeholder="e.g. Bangalore"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-grid">
            <div className="modal-field">
              <label className="modal-label">Salary</label>
              <input
                className="modal-input"
                type="text"
                name="salary"
                placeholder="e.g. 10-15 LPA"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Experience</label>
              <input
                className="modal-input"
                type="text"
                name="experienceLevel"
                placeholder="e.g. 0-2 years"
                value={formData.experienceLevel}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Application Link</label>
            <input
              className="modal-input"
              type="text"
              name="applicationLink"
              placeholder="https://..."
              value={formData.applicationLink}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Job"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
