import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./axiosConfig"; // Import axios config with interceptors
import "./App.css";
import Analytics from "./Analytics";
import JobNotes from "./JobNotes";
import Login from "./Login";
import Register from "./Register";
import { getJobs, toggleWishlist } from "./api";
import { Routes, Route } from "react-router-dom";
import NotFound from "./NotFound";
import AddJob from "./AddJob";

axios.defaults.headers.common["Authorization"] =
  `Bearer ${localStorage.getItem("token")}`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Dev bypass
  const [showRegister, setShowRegister] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showJobs, setShowJobs] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);

  // Notes states
  const [showNotes, setShowNotes] = useState(false);
  const [selectedJobIdForNotes, setSelectedJobIdForNotes] = useState(null);

  const API_URL = `${process.env.REACT_APP_API_URL}/jobs`;

  useEffect(() => {
    const initData = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
        await fetchFilters();
      } catch(err) {
        console.error(err);
      }
    };
    initData();
  }, []);

  const filterJobs = useCallback(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm]);

  useEffect(() => {
    filterJobs();
  }, [filterJobs]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const c = (!selectedCompany || selectedCompany === "All Companies") ? "" : selectedCompany;
      const e = (!selectedExperience || selectedExperience === "All Experience Levels") ? "" : selectedExperience;
      const l = (!selectedLocation || selectedLocation === "All Locations") ? "" : selectedLocation;

      const res = await axios.get(
        `${API_URL}?company=${c}&experienceLevel=${e}&location=${l}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchFilters = async () => {
    try {
      const companiesRes = await axios.get(`${API_URL}/filters/companies`);
      setCompanies(companiesRes.data || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
    
    try {
      const experienceRes = await axios.get(`${API_URL}/filters/experience-levels`);
      setExperienceLevels(experienceRes.data || []);
    } catch (err) {
      console.error("Error fetching experience:", err);
    }

    try {
      const locationsRes = await axios.get(`${API_URL}/filters/locations`);
      setLocations(locationsRes.data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
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

  const handleWishlist = async (id) => {
    const updatedJob = await toggleWishlist(id);
    setJobs(jobs.map(job =>
      job.id === id ? updatedJob : job
    ));
  };

  const openNotes = (jobId) => {
    setSelectedJobIdForNotes(jobId);
    setShowNotes(true);
  };

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    setUserEmail(localStorage.getItem("userEmail"));
    setShowRegister(false);
    await fetchJobs();
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
  const authContent = (
    <div>
      {showRegister ? (
          <Register onRegisterSuccess={handleLoginSuccess} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess}
          setShowRegister={setShowRegister} />
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

  // If authenticated, show the job tracker
  const mainContent = (
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
        <button 
          className={`nav-btn ${showAddJob ? 'active' : ''}`}
          onClick={() => setShowAddJob(true)}
        >
          ➕ Add Job
        </button>
      </div>

      {/* Add Job Modal */}
      {showAddJob && (
        <AddJob 
          onClose={() => setShowAddJob(false)} 
          onJobAdded={(newJob) => {
            setJobs([...jobs, newJob]);
            setShowAddJob(false);
            fetchFilters();
          }} 
        />
      )}

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
                    <button className="wishlist-btn active" onClick={() => handleWishlist(job.id)}>
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

        <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="filter-select">
          <option value="">All Locations</option>
          {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>

        <button onClick={() => { setShowJobs(true); fetchJobs(); }} className="toggle-btn shine-btn">
          Search Jobs ✨
        </button>
      </div>



      {/* Job Listings */}
      {showJobs && 
        <div className="list">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              console.log(job);
              return (
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
                    <a href={job.applicationLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <button className="apply-btn glow-btn">
                        🔗 Apply Now
                      </button>
                    </a>
                  )}
                  <button className="notes-btn" onClick={() => openNotes(job.id)}>
                    📝 Notes
                  </button>
                  <button 
                    className={`wishlist-btn ${job.wishlisted ? 'active' : ''}`} 
                    onClick={() => handleWishlist(job.id)}
                  >
                    {job.wishlisted ? '⭐ Saved' : '☆ Save Job'}
                  </button>
                </div>
              </div>
              );
            })
          ) : (
            <p className="no-jobs">No jobs found matching your filters</p>
          )}
          </div>
};

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

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? mainContent : authContent} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;