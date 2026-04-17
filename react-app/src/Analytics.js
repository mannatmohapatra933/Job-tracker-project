import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Analytics.css";

const API_URL = `${process.env.REACT_APP_API_URL}/jobs`;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function getStatusColor(status) {
  switch (status) {
    case "Applied": return "#cebdff";
    case "Interview": return "#dcb8ff";
    case "Interview Scheduled": return "#f59e0b";
    case "Offer": return "#6ee7b7";
    case "Under Review": return "#a78bfa";
    case "Rejected": return "#ffb4ab";
    default: return "#64748b";
  }
}

export default function Analytics({ showAnalytics, jobs = [] }) {
  const [stats, setStats] = useState(null);
  const [byStatus, setByStatus] = useState({});
  const [byCompany, setByCompany] = useState({});
  const [byExperience, setByExperience] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showAnalytics) fetchAnalytics();
    // eslint-disable-next-line
  }, [showAnalytics]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryRes, statusRes, companyRes, expRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/summary`, { headers: getHeaders() }),
        axios.get(`${API_URL}/analytics/by-status`, { headers: getHeaders() }),
        axios.get(`${API_URL}/analytics/by-company`, { headers: getHeaders() }),
        axios.get(`${API_URL}/analytics/by-experience`, { headers: getHeaders() }),
      ]);
      setStats(summaryRes.data);
      setByStatus(statusRes.data);
      setByCompany(companyRes.data);
      setByExperience(expRes.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      // Fallback: compute from props if API fails
      if (jobs.length > 0) {
        const statusMap = {};
        const companyMap = {};
        const expMap = {};
        jobs.forEach(j => {
          if (j.status) statusMap[j.status] = (statusMap[j.status] || 0) + 1;
          if (j.company) companyMap[j.company] = (companyMap[j.company] || 0) + 1;
          if (j.experienceLevel) expMap[j.experienceLevel] = (expMap[j.experienceLevel] || 0) + 1;
        });
        const interviews = jobs.filter(j => j.status === "Interview" || j.status === "Interview Scheduled").length;
        const offers = jobs.filter(j => j.status === "Offer").length;
        setStats({
          totalJobs: jobs.length,
          interviews,
          offers,
          rejected: jobs.filter(j => j.status === "Rejected").length,
          wishlisted: jobs.filter(j => j.wishlisted).length,
          offerRate: jobs.length > 0 ? (offers / jobs.length * 100) : 0,
        });
        setByStatus(statusMap);
        setByCompany(companyMap);
        setByExperience(expMap);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!showAnalytics) return null;

  if (loading) {
    return (
      <div className="analytics-loading">
        <span className="auth-spinner" style={{ width: 24, height: 24, borderWidth: 3, borderColor: "rgba(206,189,255,0.2)", borderTopColor: "var(--primary)" }}></span>
        Loading analytics...
      </div>
    );
  }

  // If still no data from API but we have jobs prop, compute on the fly
  const effectiveStats = stats || (jobs.length > 0 ? (() => {
    const interviews = jobs.filter(j => j.status === "Interview" || j.status === "Interview Scheduled").length;
    const offers = jobs.filter(j => j.status === "Offer").length;
    return {
      totalJobs: jobs.length,
      interviews,
      offers,
      rejected: jobs.filter(j => j.status === "Rejected").length,
      wishlisted: jobs.filter(j => j.wishlisted).length,
      offerRate: jobs.length > 0 ? (offers / jobs.length * 100) : 0,
    };
  })() : null);

  const total = effectiveStats?.totalJobs || 1;
  const interviewRate = effectiveStats ? ((effectiveStats.interviews / total) * 100).toFixed(1) : 0;
  const offerRate = effectiveStats ? (effectiveStats.offerRate || 0).toFixed(1) : 0;

  // Build chart data from byStatus or fallback from jobs prop
  const effectiveByStatus = Object.keys(byStatus).length > 0 ? byStatus : (() => {
    const map = {};
    jobs.forEach(j => { if (j.status) map[j.status] = (map[j.status] || 0) + 1; });
    return map;
  })();
  const effectiveByCompany = Object.keys(byCompany).length > 0 ? byCompany : (() => {
    const map = {};
    jobs.forEach(j => { if (j.company) map[j.company] = (map[j.company] || 0) + 1; });
    return map;
  })();
  const effectiveByExp = Object.keys(byExperience).length > 0 ? byExperience : (() => {
    const map = {};
    jobs.forEach(j => { if (j.experienceLevel) map[j.experienceLevel] = (map[j.experienceLevel] || 0) + 1; });
    return map;
  })();

  const topCompanies = Object.entries(effectiveByCompany).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCompanyCount = topCompanies.length ? topCompanies[0][1] : 1;

  // Build bar chart data from effectiveByStatus for trajectory
  const statusEntries = Object.entries(effectiveByStatus);

  return (
    <div className="analytics-wrap">
      <div className="analytics-page-header">
        <h1>Insights <span>Dashboard</span></h1>
        <p>Deep-dive analysis of your career trajectory and market standing.</p>
      </div>

      {/* Key Metric Cards */}
      {effectiveStats && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-card-bg">
              <span className="material-symbols-outlined">send</span>
            </div>
            <div className="metric-card-tag" style={{ color: "var(--primary)" }}>
              <span className="material-symbols-outlined">work</span>
              Total Jobs
            </div>
            <div className="metric-card-value">{effectiveStats.totalJobs}</div>
            <div className="metric-card-sub">In your tracker</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-bg">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <div className="metric-card-tag" style={{ color: "var(--secondary)" }}>
              <span className="material-symbols-outlined">trending_up</span>
              Interview Rate
            </div>
            <div className="metric-card-value">{interviewRate}%</div>
            <div className="metric-card-sub">{effectiveStats.interviews} interviews</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-bg">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div className="metric-card-tag" style={{ color: "#6ee7b7" }}>
              <span className="material-symbols-outlined">star</span>
              Offer Rate
            </div>
            <div className="metric-card-value">{offerRate}%</div>
            <div className="metric-card-sub">{effectiveStats.offers} offers received</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-bg">
              <span className="material-symbols-outlined">bookmark</span>
            </div>
            <div className="metric-card-tag" style={{ color: "var(--tertiary)" }}>
              <span className="material-symbols-outlined">favorite</span>
              Wishlisted
            </div>
            <div className="metric-card-value">{effectiveStats.wishlisted}</div>
            <div className="metric-card-sub">Saved jobs</div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="charts-row">
        {/* Status Breakdown */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <h2>Application Status</h2>
              <p>Breakdown of all applications by status</p>
            </div>
          </div>
          {statusEntries.length > 0 ? (
            <div className="status-breakdown">
              {statusEntries.map(([status, count]) => (
                <div className="status-row" key={status}>
                  <div className="status-row-header">
                    <span>{status || "Unknown"}</span>
                    <span>{count}</span>
                  </div>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill"
                      style={{
                        width: `${(count / total) * 100}%`,
                        background: getStatusColor(status),
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No data yet</p>
          )}
        </div>

        {/* Top Companies */}
        <div className="chart-panel benchmark-panel">
          <div className="chart-panel-header">
            <div>
              <h2>Top Companies</h2>
              <p>Most applied-to companies</p>
            </div>
          </div>
          <div className="benchmark-list">
            {topCompanies.length > 0 ? (
              topCompanies.map(([company, count]) => (
                <div className="benchmark-item" key={company}>
                  <div className="benchmark-item-header">
                    <span>{company}</span>
                    <span style={{ color: "var(--primary)" }}>{count}</span>
                  </div>
                  <div className="bench-bar-track">
                    <div
                      className="bench-bar-fill"
                      style={{
                        width: `${(count / maxCompanyCount) * 100}%`,
                        background: "linear-gradient(90deg, var(--primary-container), var(--primary))",
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Experience Breakdown */}
      {Object.keys(effectiveByExp).length > 0 && (
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <h2>Jobs by Experience Level</h2>
              <p>Distribution across experience tiers</p>
            </div>
          </div>
          <div className="status-breakdown">
            {Object.entries(effectiveByExp).map(([exp, count]) => (
              <div className="status-row" key={exp}>
                <div className="status-row-header">
                  <span>{exp || "Any"}</span>
                  <span>{count}</span>
                </div>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${(count / total) * 100}%`,
                      background: "var(--secondary)",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
