import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Analytics.css';

function Analytics({ showAnalytics }) {
  const [stats, setStats] = useState(null);
  const [byStatus, setByStatus] = useState({});
  const [byCompany, setByCompany] = useState({});
  const [byExperience, setByExperience] = useState({});
  const [loading, setLoading] = useState(true);

  const API_URL = `${process.env.REACT_APP_API_URL}/jobs`;

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    if (showAnalytics) {
      fetchAnalytics();
    }
  }, [showAnalytics]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const summaryRes = await axios.get(`${API_URL}/analytics/summary`, { headers: getHeaders() });
      const statusRes = await axios.get(`${API_URL}/analytics/by-status`, { headers: getHeaders() });
      const companyRes = await axios.get(`${API_URL}/analytics/by-company`, { headers: getHeaders() });
      const experienceRes = await axios.get(`${API_URL}/analytics/by-experience`, { headers: getHeaders() });

      setStats(summaryRes.data);
      setByStatus(statusRes.data);
      setByCompany(companyRes.data);
      setByExperience(experienceRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setLoading(false);
    }
  };

  if (!showAnalytics) return null;

  return (
    <div className="analytics-container">
      <h2>📊 Analytics Dashboard</h2>

      {loading ? (
        <p className="loading">Loading analytics...</p>
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className="cards-grid">
            <div className="stat-card total">
              <h3>{stats.totalJobs}</h3>
              <p>Total Jobs</p>
            </div>
            <div className="stat-card applications">
              <h3>{stats.totalApplications}</h3>
              <p>Applications</p>
            </div>
            <div className="stat-card interviews">
              <h3>{stats.interviews}</h3>
              <p>Interviews</p>
            </div>
            <div className="stat-card offers">
              <h3>{stats.offers}</h3>
              <p>Offers</p>
            </div>
            <div className="stat-card rejected">
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
            <div className="stat-card wishlisted">
              <h3>{stats.wishlisted}</h3>
              <p>Wishlisted</p>
            </div>
            <div className="stat-card rate">
              <h3>{stats.offerRate.toFixed(1)}%</h3>
              <p>Offer Rate</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            {/* By Status */}
            <div className="chart-box">
              <h3>Jobs by Status</h3>
              <div className="chart-data">
                {Object.entries(byStatus).map(([status, count]) => (
                  <div className="chart-row" key={status}>
                    <span className="label">{status || 'N/A'}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ 
                          width: `${(count / stats.totalJobs * 100)}%`,
                          backgroundColor: getStatusColor(status)
                        }}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Experience */}
            <div className="chart-box">
              <h3>Jobs by Experience</h3>
              <div className="chart-data">
                {Object.entries(byExperience).map(([exp, count]) => (
                  <div className="chart-row" key={exp}>
                    <span className="label">{exp || 'Any'}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ width: `${(count / stats.totalJobs * 100)}%` }}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Company Top 10 */}
            <div className="chart-box">
              <h3>Top Companies</h3>
              <div className="chart-data">
                {Object.entries(byCompany)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([company, count]) => (
                    <div className="chart-row" key={company}>
                      <span className="label">{company}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress" 
                          style={{ width: `${(count / Math.max(...Object.values(byCompany)) * 100)}%` }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'Applied': return '#3b82f6';
    case 'Interview': return '#f59e0b';
    case 'Interview Scheduled': return '#ff9800';
    case 'Offer': return '#10b981';
    case 'Under Review': return '#8b5cf6';
    case 'Rejected': return '#ef4444';
    default: return '#6b7280';
  }
}

export default Analytics;
