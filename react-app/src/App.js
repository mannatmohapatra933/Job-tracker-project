import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import "./axiosConfig";
import "./App.css";
import Analytics from "./Analytics";
import JobNotes from "./JobNotes";
import Login from "./Login";
import Register from "./Register";
import AddJob from "./AddJob";
import Settings from "./Settings";
import { getJobs, toggleWishlist } from "./api";
import { Routes, Route } from "react-router-dom";
import NotFound from "./NotFound";

axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

function getStatusBadgeClass(status) {
  switch (status) {
    case "Applied": return "status-badge badge-applied";
    case "Interview":
    case "Interview Scheduled": return "status-badge badge-interview";
    case "Offer": return "status-badge badge-offer";
    case "Rejected": return "status-badge badge-rejected";
    case "Under Review": return "status-badge badge-review";
    default: return "status-badge badge-default";
  }
}

function getCompanyInitials(name) {
  if (!name) return "?";
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const [activeView, setActiveView] = useState("dashboard");

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [locations, setLocations] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // STEP 2: status filter
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddJob, setShowAddJob] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedJobIdForNotes, setSelectedJobIdForNotes] = useState(null);

  // STEP 3: Notifications
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const API_URL = `${process.env.REACT_APP_API_URL}/jobs`;

  useEffect(() => {
    if (isAuthenticated) {
      const initData = async () => {
        try {
          const data = await getJobs();
          setJobs(data);
          await fetchFilters();
        } catch (err) {
          console.error(err);
        }
      };
      initData();
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterJobs = useCallback(() => {
    let filtered = jobs;
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // STEP 2: Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((job) => {
        if (statusFilter === "interview") {
          return job.status === "Interview" || job.status === "Interview Scheduled";
        }
        if (statusFilter === "offer") return job.status === "Offer";
        if (statusFilter === "rejected") return job.status === "Rejected";
        if (statusFilter === "applied") return job.status === "Applied";
        return true;
      });
    }
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter]);

  useEffect(() => { filterJobs(); }, [filterJobs]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const c = !selectedCompany || selectedCompany === "All Companies" ? "" : selectedCompany;
      const e = !selectedExperience || selectedExperience === "All Experience Levels" ? "" : selectedExperience;
      const l = !selectedLocation || selectedLocation === "All Locations" ? "" : selectedLocation;
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
    } catch (err) { console.error(err); }
    try {
      const expRes = await axios.get(`${API_URL}/filters/experience-levels`);
      setExperienceLevels(expRes.data || []);
    } catch (err) { console.error(err); }
    try {
      const locRes = await axios.get(`${API_URL}/filters/locations`);
      setLocations(locRes.data || []);
    } catch (err) { console.error(err); }
  };

  const handleWishlist = async (id) => {
    const updatedJob = await toggleWishlist(id);
    setJobs(jobs.map((job) => (job.id === id ? updatedJob : job)));
  };

  const openNotes = (jobId) => {
    setSelectedJobIdForNotes(jobId);
    setShowNotes(true);
  };

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    setUserEmail(localStorage.getItem("userEmail") || "");
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
    setActiveView("dashboard");
  };

  // Stat computations
  const totalApps = jobs.filter((j) => j.status).length;
  const interviews = jobs.filter((j) => j.status === "Interview" || j.status === "Interview Scheduled").length;
  const offers = jobs.filter((j) => j.status === "Offer").length;
  const rejections = jobs.filter((j) => j.status === "Rejected").length;
  const wishlistedJobs = jobs.filter((j) => j.wishlisted);
  const displayName = localStorage.getItem("fullName") || userEmail || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // STEP 1: Navigate to jobs with a status filter
  const goToFilteredJobs = (filter) => {
    setStatusFilter(filter);
    setActiveView("jobs");
  };

  // STEP 3: Notification messages
  const notifications = [
    interviews > 0
      ? { icon: "forum", color: "var(--secondary)", text: `You have ${interviews} interview${interviews > 1 ? "s" : ""} scheduled.` }
      : null,
    offers > 0
      ? { icon: "verified", color: "#6ee7b7", text: `🎉 You received ${offers} offer${offers > 1 ? "s" : ""}!` }
      : null,
    jobs.length > 0
      ? { icon: "analytics", color: "var(--primary)", text: `Tracking ${jobs.length} application${jobs.length > 1 ? "s" : ""} in total.` }
      : null,
    { icon: "tips_and_updates", color: "#f59e0b", text: "Tip: Keep your wishlist updated for quick apply!" },
  ].filter(Boolean);

  // Auth screens
  const authContent = (
    <div>
      {showRegister ? (
        <Register onRegisterSuccess={handleLoginSuccess} setShowRegister={setShowRegister} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} setShowRegister={setShowRegister} />
      )}
    </div>
  );

  // Job card renderer
  const renderJobCard = (job) => (
    <div className="job-card" key={job.id}>
      <div className="job-card-logo">{getCompanyInitials(job.company)}</div>
      <div className="job-card-body">
        <div className="job-card-top">
          <span className="job-card-company">{job.company}</span>
          <span className={getStatusBadgeClass(job.status)}>{job.status}</span>
        </div>
        <div className="job-card-role">{job.role}</div>
        <div className="job-card-meta">
          {job.location && (
            <span className="job-card-meta-item">
              <span className="material-symbols-outlined">location_on</span>
              {job.location}
            </span>
          )}
          {job.experienceLevel && (
            <span className="job-card-meta-item">
              <span className="material-symbols-outlined">bar_chart</span>
              {job.experienceLevel}
            </span>
          )}
          {job.salary && (
            <span className="job-card-meta-item">
              <span className="material-symbols-outlined">payments</span>
              {job.salary}
            </span>
          )}
        </div>
      </div>
      <div className="job-card-actions">
        {job.applicationLink && (
          <a href={job.applicationLink} target="_blank" rel="noopener noreferrer">
            <button className="apply-btn-new" title="Apply">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
              Apply
            </button>
          </a>
        )}
        <button
          className="job-card-action-btn"
          onClick={() => openNotes(job.id)}
          title="Notes"
        >
          <span className="material-symbols-outlined">edit_note</span>
        </button>
        <button
          className={`job-card-action-btn ${job.wishlisted ? "active" : ""}`}
          onClick={() => handleWishlist(job.id)}
          title={job.wishlisted ? "Remove from wishlist" : "Save to wishlist"}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: job.wishlisted ? "'FILL' 1" : "'FILL' 0" }}>
            bookmark
          </span>
        </button>
      </div>
    </div>
  );

  // Dashboard View — STEP 1: Cards are now clickable
  const DashboardView = () => (
    <div>
      <div className="section-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div className="section-title">Dashboard</div>
          <div className="section-sub">Welcome back, {displayName}. Here's your job hunt at a glance.</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card-new clickable" onClick={() => goToFilteredJobs("")} style={{ cursor: "pointer" }}>
          <div className="stat-card-bg-icon">
            <span className="material-symbols-outlined">send</span>
          </div>
          <div className="stat-card-label">Total Applications</div>
          <div className="stat-card-value" style={{ color: "var(--primary)" }}>{jobs.length}</div>
          <div className="stat-card-meta" style={{ color: "var(--primary)" }}>{totalApps} with status</div>
        </div>

        <div className="stat-card-new clickable" onClick={() => goToFilteredJobs("interview")} style={{ cursor: "pointer" }}>
          <div className="stat-card-bg-icon">
            <span className="material-symbols-outlined">forum</span>
          </div>
          <div className="stat-card-label">Interviews</div>
          <div className="stat-card-value" style={{ color: "var(--secondary)" }}>{interviews}</div>
          <div className="stat-card-meta" style={{ color: "var(--secondary)" }}>Tap to view →</div>
        </div>

        <div className="stat-card-new clickable" onClick={() => goToFilteredJobs("offer")} style={{ cursor: "pointer" }}>
          <div className="stat-card-bg-icon">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div className="stat-card-label">Offers</div>
          <div className="stat-card-value" style={{ color: "#6ee7b7" }}>{offers}</div>
          <div className="stat-card-meta" style={{ color: "#6ee7b7" }}>Tap to view →</div>
        </div>

        <div className="stat-card-new clickable" onClick={() => goToFilteredJobs("rejected")} style={{ cursor: "pointer" }}>
          <div className="stat-card-bg-icon">
            <span className="material-symbols-outlined">block</span>
          </div>
          <div className="stat-card-label">Rejections</div>
          <div className="stat-card-value" style={{ color: "#94a3b8" }}>{rejections}</div>
          <div className="stat-card-meta" style={{ color: "#64748b" }}>Tap to view →</div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="section-header">
        <div>
          <div className="section-title">Active Flow</div>
          <div className="section-sub">Your most recent applications</div>
        </div>
        <button
          className="filter-search-btn"
          onClick={() => goToFilteredJobs("")}
        >
          View All
        </button>
      </div>
      <div className="jobs-section">
        {filteredJobs.slice(0, 5).length > 0 ? (
          filteredJobs.slice(0, 5).map(renderJobCard)
        ) : (
          <div className="empty-state">
            <span className="material-symbols-outlined">work_off</span>
            <p>No applications yet. Add your first job!</p>
          </div>
        )}
      </div>
    </div>
  );

  // Applications View — STEP 2: Status filter chip bar
  const JobsView = () => (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Applications</div>
          <div className="section-sub">Search and filter your job applications</div>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="status-chips">
        {[
          { label: "All", value: "" },
          { label: "Applied", value: "applied" },
          { label: "Interview", value: "interview" },
          { label: "Offer", value: "offer" },
          { label: "Rejected", value: "rejected" },
        ].map((chip) => (
          <button
            key={chip.value}
            className={`status-chip ${statusFilter === chip.value ? "active" : ""}`}
            onClick={() => setStatusFilter(chip.value)}
          >
            {chip.label}
            {chip.value === "" && <span className="chip-count">{jobs.length}</span>}
            {chip.value === "interview" && interviews > 0 && <span className="chip-count">{interviews}</span>}
            {chip.value === "offer" && offers > 0 && <span className="chip-count">{offers}</span>}
            {chip.value === "rejected" && rejections > 0 && <span className="chip-count">{rejections}</span>}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <select
          className="filter-select-new"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          <option value="">All Companies</option>
          {companies.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="filter-select-new"
          value={selectedExperience}
          onChange={(e) => setSelectedExperience(e.target.value)}
        >
          <option value="">All Experience Levels</option>
          {experienceLevels.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select
          className="filter-select-new"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button className="filter-search-btn" onClick={fetchJobs}>
          Search ✨
        </button>
      </div>
      <div className="jobs-section">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(renderJobCard)
        ) : (
          <div className="empty-state">
            <span className="material-symbols-outlined">search_off</span>
            <p>No jobs found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Wishlist View
  const WishlistView = () => (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Wishlist</div>
          <div className="section-sub">Jobs you've saved for later</div>
        </div>
      </div>
      {wishlistedJobs.length > 0 ? (
        <div className="wishlist-grid">
          {wishlistedJobs.map((job) => (
            <div className="wishlist-card" key={job.id}>
              <div className="wishlist-card-header">
                <div>
                  <h4>{job.company}</h4>
                  <p>{job.role}</p>
                </div>
                <span className={getStatusBadgeClass(job.status)}>{job.status}</span>
              </div>
              {job.location && (
                <span className="job-card-meta-item">
                  <span className="material-symbols-outlined">location_on</span>
                  {job.location}
                </span>
              )}
              <button className="wishlist-remove-btn" onClick={() => handleWishlist(job.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="material-symbols-outlined">bookmark_border</span>
          <p>No saved jobs yet. Bookmark jobs from the Applications tab.</p>
        </div>
      )}
    </div>
  );

  // Main authenticated layout
  const mainContent = (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <div>
            <div className="sidebar-logo-name">JobFlow AI</div>
            <div className="sidebar-logo-sub">Intelligent Luminary</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { view: "dashboard", icon: "dashboard", label: "Dashboard" },
            { view: "jobs", icon: "work", label: "Applications" },
            { view: "analytics", icon: "analytics", label: "Insights" },
            { view: "wishlist", icon: "bookmark", label: "Wishlist" },
          ].map(({ view, icon, label }) => (
            <button
              key={view}
              className={`sidebar-link ${activeView === view ? "active" : ""}`}
              onClick={() => setActiveView(view)}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-add-btn" onClick={() => setShowAddJob(true)}>
            <span className="material-symbols-outlined">add</span>
            Add New Job
          </button>
          {/* STEP 4: Settings button in sidebar */}
          <button
            className={`sidebar-link ${activeView === "settings" ? "active" : ""}`}
            onClick={() => setActiveView("settings")}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
          <button className="sidebar-link" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Header */}
        <header className="top-header">
          <div className="header-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search applications, roles, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="header-right">
            {/* STEP 3: Notification Bell */}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                className={`header-icon-btn notif-btn ${showNotif ? "active" : ""}`}
                title="Notifications"
                onClick={() => setShowNotif(!showNotif)}
              >
                <span className="material-symbols-outlined">notifications</span>
                {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
              </button>
              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <span>Notifications</span>
                    <span className="notif-count-tag">{notifications.length} new</span>
                  </div>
                  <div className="notif-list">
                    {notifications.map((n, i) => (
                      <div className="notif-item" key={i}>
                        <span
                          className="material-symbols-outlined notif-icon"
                          style={{ color: n.color }}
                        >
                          {n.icon}
                        </span>
                        <span>{n.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4: Settings icon */}
            <button
              className={`header-icon-btn ${activeView === "settings" ? "active" : ""}`}
              title="Settings"
              onClick={() => setActiveView("settings")}
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="header-divider"></div>
            <div className="header-user">
              <div className="header-user-info">
                <span className="header-user-name">{displayName}</span>
                <span className="header-user-role">Premium Tier</span>
              </div>
              <div className="header-avatar">{avatarLetter}</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="content-area">
          {activeView === "dashboard" && <DashboardView />}
          {activeView === "jobs" && <JobsView />}
          {activeView === "analytics" && <Analytics showAnalytics={true} jobs={jobs} />}
          {activeView === "wishlist" && <WishlistView />}
          {activeView === "settings" && (
            <Settings
              onLogout={handleLogout}
              displayName={displayName}
              userEmail={userEmail}
            />
          )}
        </div>
      </main>

      {/* FAB */}
      <button className="fab-btn" onClick={() => setShowAddJob(true)} title="Add Job">
        <span className="material-symbols-outlined">add</span>
      </button>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {[
          { view: "dashboard", icon: "dashboard", label: "Home" },
          { view: "jobs", icon: "work", label: "Jobs" },
          { view: "analytics", icon: "analytics", label: "Insights" },
          { view: "wishlist", icon: "bookmark", label: "Saved" },
          { view: "settings", icon: "settings", label: "Settings" },
        ].map(({ view, icon, label }) => (
          <button
            key={view}
            className={`mobile-nav-item ${activeView === view ? "active" : ""}`}
            onClick={() => setActiveView(view)}
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* Modals */}
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