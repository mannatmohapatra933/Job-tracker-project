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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        console.error("Failed to add job");
      }
    } catch (error) {
      console.error("Error adding job:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-job-card">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>➕ Add New Job</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="role"
            placeholder="Job Role"
            value={formData.role}
            onChange={handleChange}
            required
          />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
          <input
            type="text"
            name="salary"
            placeholder="Salary (e.g., 10-15 LPA)"
            value={formData.salary}
            onChange={handleChange}
          />
          <input
            type="text"
            name="experienceLevel"
            placeholder="Experience (e.g., 0-2)"
            value={formData.experienceLevel}
            onChange={handleChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Location (e.g., Bangalore)"
            value={formData.location}
            onChange={handleChange}
          />
          <input
            type="text"
            name="applicationLink"
            placeholder="Application Link"
            value={formData.applicationLink}
            onChange={handleChange}
          />
          <button type="submit" className="glow-btn submit-btn">
            Save Job
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
