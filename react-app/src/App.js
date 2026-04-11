import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./axiosConfig"; // Import axios config with interceptors
import "./App.css";
import Analytics from "./Analytics";
import JobNotes from "./JobNotes";
import Login from "./Login";
import Register from "./Register";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showJobs, setShowJobs] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  // Notes states
  const [showNotes, setShowNotes] = useState(false);
  const [selectedJobIdForNotes, setSelectedJobIdForNotes] = useState(null);

  // Form states for adding custom jobs
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [editId, setEditId] = useState(null);

  const API_URL = "http://localhost:8081/jobs";

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    
    if (token && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
      fetchJobs();
      fetchFilters();
    }
  }, []);

  const filterJobs = useCallback(() => {
    let filtered = jobs;

    if (selectedCompany) {
      filtered = filtered.filter(job => job.company === selectedCompany);
    }

    if (selectedExperience) {
      filtered = filtered.filter(job => job.experienceLevel === selectedExperience);
    }

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, selectedCompany, selectedExperience, searchTerm]);

  useEffect(() => {
    filterJobs();
  }, [filterJobs]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(API_URL);
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchFilters = async () => {
    try {
      const companiesRes = await axios.get(`${API_URL}/filters/companies`);
      const experienceRes = await axios.get(`${API_URL}/filters/experience-levels`);
      setCompanies(companiesRes.data || []);
      setExperienceLevels(experienceRes.data || []);
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };

  const addOrUpdateJob = async () => {
    if (!company || !role) return;

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, { company, role, status });
        setEditId(null);
      } else {
        await axios.post(API_URL, { company, role, status });
      }

      setCompany("");
      setRole("");
      setStatus("Applied");
      setShowForm(false);
      fetchJobs();
    } catch (err) {
      console.error("Error saving job:", err);
    }
  };

  const deleteJob = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const editJob = (job) => {
    setCompany(job.company);
    setRole(job.role);
    setStatus(job.status);
    setEditId(job.id);
    setShowForm(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Applied': return { backgroundColor: 'blue', color: 'white' };
      case 'Interview': return { backgroundColor: '#ff9800', color: 'white' };
      case 'Interview Scheduled': return { backgroundColor: 'orange', color: 'white' };
      case 'Offer': return { backgroundColor: 'green', color: 'white' };
      case 'Under Review': return { backgroundColor: '#9c27b0', color: 'white' };
      case 'Rejected': return { backgroundColor: 'red', color: 'white' };
      default: return { backgroundColor: '#666', color: 'white' };
    }
  };

  const handleApplyClick = (job) => {
    if (job.applicationLink) {
      window.open(job.applicationLink, '_blank');
    }
  };

  const toggleWishlist = async (job) => {
    try {
      await axios.put(`${API_URL}/${job.id}/wishlist`);
      fetchJobs();
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  const openNotes = (jobId) => {
    setSelectedJobIdForNotes(jobId);
    setShowNotes(true);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUserEmail(localStorage.getItem("userEmail"));
    setShowRegister(false);
    fetchJobs();
    fetchFilters();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    setIsAuthenticated(false);
    setUserEmail("");
    setJobs([]);
    setFilteredJobs([]);
  };

  // If not authenticated, show login/register
  if (!isAuthenticated) {
    return (
      <div>
        {showRegister ? (
          <Register onRegisterSuccess={handleLoginSuccess} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
        <div style={{ textAlign: "center", marginTop: "20px", color: "#999" }}>
          {showRegister ? (
            <p style={{ color: "#a78bfa" }}>
              Already have an account?{" "}
              <span
                onClick={() => setShowRegister(false)}
                style={{
                  color: "#8a2be2",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Login here
              </span>
            </p>
          ) : (
            <p style={{ color: "#a78bfa" }}>
              Don't have an account?{" "}
              <span
                onClick={() => setShowRegister(true)}
                style={{
                  color: "#8a2be2",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Register here
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // If authenticated, show the job tracker
  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>💼 Job Application Tracker</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ color: "#a78bfa" }}>👤 {userEmail}</span>
          <button 
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Top Navigation Buttons */}
      <div className="top-nav">
        <button 
          className={`nav-btn ${showAnalytics ? 'active' : ''}`}
          onClick={() => setShowAnalytics(!showAnalytics)}
        >
          📊 Analytics
        </button>
        <button 
          className={`nav-btn ${showWishlist ? 'active' : ''}`}
          onClick={() => setShowWishlist(!showWishlist)}
        >
          ⭐ Wishlist
        </button>
        <button 
          className={`nav-btn ${showJobs ? 'active' : ''}`}
          onClick={() => setShowJobs(!showJobs)}
        >
          📋 Jobs
        </button>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && <Analytics showAnalytics={showAnalytics} />}

      {/* Wishlist Section */}
      {showWishlist && (
        <div className="wishlist-section">
          <h2>⭐ My Wishlist</h2>
          <div className="list">
            {jobs.filter(j => j.wishlisted).length > 0 ? (
              jobs.filter(j => j.wishlisted).map((job) => (
                <div className="card" key={job.id}>
                  <div className="card-header">
                    <div className="company-section">
                      <h3>{job.company}</h3>
                      <p className="location">{job.location}</p>
                    </div>
                    <span className="status-badge" style={getStatusStyle(job.status)}>
                      {job.status}
                    </span>
                  </div>

                  <div className="card-body">
                    <h4 className="job-title">{job.role}</h4>
                    {job.salary && <p><strong>💰 Salary:</strong> {job.salary}</p>}
                  </div>

                  <div className="card-footer">
                    <button className="wishlist-btn active" onClick={() => toggleWishlist(job)}>
                      ⭐ Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-jobs">No wishlisted jobs yet</p>
            )}
          </div>
        </div>
      )}

      {/* Search & Filter Section */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="Search by role, company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="filter-select">
          <option value="">All Companies</option>
          {companies.map(comp => <option key={comp} value={comp}>{comp}</option>)}
        </select>

        <select value={selectedExperience} onChange={(e) => setSelectedExperience(e.target.value)} className="filter-select">
          <option value="">All Experience Levels</option>
          {experienceLevels.map(exp => <option key={exp} value={exp}>{exp}</option>)}
        </select>

        <button onClick={() => setShowForm(!showForm)} className="add-custom-btn">
          {showForm ? "Cancel" : "+ Add Custom Job"}
        </button>

        <button onClick={() => setShowJobs(!showJobs)} className="toggle-btn">
          {showJobs ? "Hide Jobs" : "Show Jobs"}
        </button>
      </div>

      {/* Add Custom Job Form */}
      {showForm && (
        <div className="form">
          <input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <input
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Applied</option>
            <option>Interview</option>
            <option>Interview Scheduled</option>
            <option>Offer</option>
            <option>Under Review</option>
            <option>Rejected</option>
          </select>
          <button onClick={addOrUpdateJob}>
            {editId ? "Update" : "Add Job"}
          </button>
        </div>
      )}

      {/* Job Listings */}
      {showJobs && (
        <div className="list">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div className="card" key={job.id}>
                <div className="card-header">
                  <div className="company-section">
                    <h3>{job.company}</h3>
                    <p className="location">{job.location}</p>
                  </div>
                  <span className="status-badge" style={getStatusStyle(job.status)}>
                    {job.status}
                  </span>
                </div>

                <div className="card-body">
                  <h4 className="job-title">{job.role}</h4>

                  {job.salary && <p><strong>💰 Salary:</strong> {job.salary}</p>}
                  {job.experienceLevel && <p><strong>📊 Experience:</strong> {job.experienceLevel}</p>}
                  {job.qualifications && <p><strong>🎓 Qualifications:</strong> {job.qualifications}</p>}
                  {job.jobDescription && <p><strong>📝 Description:</strong> {job.jobDescription}</p>}
                  {job.interviewSchedule && <p><strong>📅 Interview:</strong> {job.interviewSchedule}</p>}
                  {job.offerDetails && <p><strong>🎁 Offer:</strong> {job.offerDetails}</p>}
                </div>

                <div className="card-footer">
                  {job.applicationLink && (
                    <button className="apply-btn" onClick={() => handleApplyClick(job)}>
                      🔗 Apply
                    </button>
                  )}
                  <button className="notes-btn" onClick={() => openNotes(job.id)}>
                    📝 Notes
                  </button>
                  <button 
                    className={`wishlist-btn ${job.wishlisted ? 'active' : ''}`} 
                    onClick={() => toggleWishlist(job)}
                  >
                    {job.wishlisted ? '⭐ Remove' : '☆ Wishlist'}
                  </button>
                  <button className="edit-btn" onClick={() => editJob(job)}>
                    ✏️ Edit
                  </button>
                  <button className="delete-btn" onClick={() => deleteJob(job.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-jobs">No jobs found matching your filters</p>
          )}
        </div>
      )}

      <div className="stats">
        <p>Total Jobs: {jobs.length} | Filtered: {filteredJobs.length}</p>
      </div>

      {/* Notes Modal */}
      <JobNotes 
        jobId={selectedJobIdForNotes} 
        showNotes={showNotes}
        onClose={() => setShowNotes(false)}
      />
    </div>
  );
}

export default App;