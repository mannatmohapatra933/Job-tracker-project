import React, { useState, useRef, useCallback } from "react";
import "./AIMatch.css";
import { toggleWishlist, matchResume, addJob } from "./api";
import * as pdfjsLib from "pdfjs-dist";

// Use the bundled worker from public folder (local, no CDN dependency)
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function AIMatch({ jobs = [], onJobSaved }) {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState(new Set());
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const [useLiveSearch, setUseLiveSearch] = useState(false);

  // ---- PDF text extraction ----
  const extractPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText.trim();
  };

  // ---- File reading (drag & drop / click) ----
  const readFile = async (file) => {
    if (!file) return;
    setError("");
    setFileLoading(true);
    setFileName(file.name);
    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const text = await extractPdfText(file);
        if (!text) throw new Error("Could not extract text from this PDF. Try a text-based PDF.");
        setResumeText(text);
      } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (e) => { setResumeText(e.target.result); };
        reader.readAsText(file);
      } else {
        setError("Unsupported file type. Please drop a .pdf or .txt file.");
        setFileName("");
      }
    } catch (e) {
      setError(`File read error: ${e.message}`);
      setFileName("");
    } finally {
      setFileLoading(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    readFile(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => readFile(e.target.files?.[0]);



  // ---- Analyze ----
  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      setError("Resume text is empty! Please paste or drop your resume.");
      return;
    }

    if (jobs.length === 0) {
      setError("No jobs available to match against. Please wait for jobs to load.");
      return;
    }

    setLoading(true);
    setError("");
    setMatches([]);
    setSummary("");
    setHasAnalyzed(false);

    try {
      // Limit resume text to avoid token overflow causing truncated AI responses
      const safeResumeText = resumeText.substring(0, 15000);

      let prompt = "";
      if (useLiveSearch) {
        prompt = `You are a career advisor. Search the internet for active, real-time job openings that exactly match this candidate's profile.
Return ONLY a valid JSON object. Do not include markdown formatting or extra text.
RESUME:
"""
${safeResumeText}
"""

REQUIRED JSON FORMAT:
{
  "summary": "2 sentence overall analysis",
  "matches": [
    {
      "id": "generate_a_random_unique_string",
      "company": "Company Name",
      "role": "Job Title",
      "location": "Job Location",
      "experienceLevel": "Experience required",
      "salary": "Estimated Salary or N/A",
      "applicationLink": "Exact URL to apply for this job post",
      "score": <number 0-100>,
      "reason": "1 sentence reason why it matches"
    }
  ]
}`;
      } else {
        const jobsList = jobs
          .map(
            (j, i) =>
              `${i + 1}. ID:${j.id} | Company: ${j.company} | Role: ${j.role} | Skills: ${j.jobDescription || ""}`
          )
          .join("\n");

        prompt = `You are a career advisor. Return ONLY a valid JSON object. Do not include markdown formatting or extra text.
RESUME:
"""
${safeResumeText}
"""
AVAILABLE JOBS:
${jobsList}

REQUIRED JSON FORMAT:
{
  "summary": "2 sentence overall analysis",
  "matches": [
    {
      "jobId": <number>,
      "score": <number 0-100>,
      "reason": "1 sentence reason"
    }
  ]
}`;
      }

      const data = await matchResume(prompt, useLiveSearch);
      
      // Combine all parts just in case response is split
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const rawText = parts.map(p => p.text).join("") || "";
      
      console.log("RAW AI RESPONSE:", rawText);

      if (!rawText) {
        throw new Error("Empty response from AI");
      }

      // Clean markdown fences if they exist
      let cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const jsonStart = cleaned.indexOf("{");
      const jsonEnd = cleaned.lastIndexOf("}");
      
      if (jsonStart === -1 || jsonEnd === -1) {
        // Fallback: try parsing the whole cleaned string if { or } is missing
        try {
          const parsed = JSON.parse(cleaned + (jsonEnd === -1 ? "}" : ""));
          cleaned = JSON.stringify(parsed);
        } catch (e) {
          throw new Error("JSON Object not found or truncated. RAW: " + rawText.substring(0, 150));
        }
      } else {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }
      
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        throw new Error(`JSON format error: ${parseErr.message}. RAW: ${cleaned.substring(0, 100)}`);
      }

      setSummary(parsed.summary || "");

      let matchedJobs = [];
      if (useLiveSearch) {
        matchedJobs = (parsed.matches || []).map(m => ({
          ...m,
          id: m.id || Math.random().toString(36).substring(7),
          isLiveGenerated: true
        }));
      } else {
        matchedJobs = (parsed.matches || [])
          .map((m) => {
            const job = jobs.find((j) => j.id === m.jobId);
            return job ? { ...job, score: m.score, reason: m.reason } : null;
          })
          .filter(Boolean);
      }

      setMatches(matchedJobs);
      setHasAnalyzed(true);
    } catch (e) {
      console.error("AI Match Error:", e);
      if (e.message.includes("API_KEY") || e.message.includes("key")) {
        setError("Invalid API key. Check your REACT_APP_GEMINI_API_KEY in .env file.");
      } else {
        // Show exactly what the error is and which URL was hit
        const apiUrl = process.env.REACT_APP_API_URL || "unknown";
        setError(`Error: ${e.message} (URL: ${apiUrl}/ai/match)`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToWishlist = async (job) => {
    try {
      if (job.isLiveGenerated) {
        // Add job to backend
        const newJob = await addJob({
          company: job.company,
          role: job.role,
          location: job.location,
          status: "Saved",
          experienceLevel: job.experienceLevel,
          salary: job.salary,
          applicationLink: job.applicationLink,
          jobDescription: job.reason,
          wishlisted: true
        });
        setSavedIds((prev) => new Set([...prev, job.id]));
        if (onJobSaved) onJobSaved(newJob.id);
      } else {
        await toggleWishlist(job.id);
        setSavedIds((prev) => new Set([...prev, job.id]));
        if (onJobSaved) onJobSaved(job.id);
      }
    } catch (e) {
      console.error("Failed to save to wishlist:", e);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 75) return "high";
    if (score >= 55) return "medium";
    return "low";
  };

  return (
    <div className="ai-match-page">
      {/* Header */}
      <div className="ai-match-header">
        <div>
          <div className="ai-match-badge">
            <span className="material-symbols-outlined">auto_awesome</span>
            Powered by Gemini AI
          </div>
          <div className="section-title">AI Resume Matcher</div>
          <div className="section-sub">
            Drop your resume or paste the text — AI will find your best matching jobs
          </div>
        </div>
      </div>

      {/* Input + Tips Grid */}
      <div className="ai-match-grid">
        {/* Resume Input Panel */}
        <div className="ai-panel">
          <div className="ai-panel-title">
            <span className="material-symbols-outlined">description</span>
            Resume Text
          </div>

          {/* Drop Zone */}
          <div
            className={`ai-drop-zone ${isDragging ? "dragging" : ""} ${resumeText ? "has-content" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={!resumeText ? handleFileClick : undefined}
          >
            {fileLoading ? (
              <div className="ai-drop-placeholder">
                <div className="ai-loading-spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                <div className="ai-drop-text">
                  <strong>Reading PDF...</strong>
                  <span>Extracting text from your resume</span>
                </div>
              </div>
            ) : !resumeText ? (
              <div className="ai-drop-placeholder">
                <span className="material-symbols-outlined ai-drop-icon">upload_file</span>
                <div className="ai-drop-text">
                  <strong>Drop your resume here</strong>
                  <span>or click to browse</span>
                </div>
                <div className="ai-drop-hint">Supports .pdf and .txt files</div>
              </div>
            ) : (
              <div className="ai-drop-loaded">
                <span className="material-symbols-outlined" style={{ color: "#6ee7b7" }}>task_alt</span>
                <span>{fileName || "File"} loaded — {resumeText.length} characters</span>
                <button className="ai-clear-btn" onClick={(e) => { e.stopPropagation(); setResumeText(""); setFileName(""); setHasAnalyzed(false); }}>
                  Clear
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <textarea
            className="ai-resume-textarea"
            placeholder="Or paste your resume text here... (Skills, Experience, Education, Projects)"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            disabled={loading}
          />

          {error && (
            <div className="ai-error-box">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', padding: '10px', background: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
            <input 
              type="checkbox" 
              id="liveSearchToggle" 
              checked={useLiveSearch}
              onChange={(e) => setUseLiveSearch(e.target.checked)}
              style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="liveSearchToggle" style={{ color: '#f8fafc', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#38bdf8' }}>travel_explore</span>
              Search live internet for new jobs (Google Search)
            </label>
          </div>

          <button
            className="ai-analyze-btn"
            onClick={analyzeResume}
            disabled={loading || !resumeText.trim()}
          >
            {loading ? (
              <>
                <div className="ai-loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Analyzing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">psychology</span>
                Match My Resume
              </>
            )}
          </button>
        </div>

        {/* Tips Panel */}
        <div className="ai-panel">
          <div className="ai-panel-title">
            <span className="material-symbols-outlined">tips_and_updates</span>
            Tips for Best Results
          </div>
          <div className="ai-tips">
            {[
              { icon: "check_circle", text: "List all your technical skills clearly (Java, React, Python, etc.)" },
              { icon: "check_circle", text: "Include company name and role title in your experience section" },
              { icon: "check_circle", text: "Mention technologies and achievements in your projects" },
              { icon: "check_circle", text: "Include your degree and specialization in the education section" },
              { icon: "lightbulb", text: "The more detailed your resume, the more accurate the matches!" },
              { icon: "info", text: `${jobs.length} job${jobs.length !== 1 ? "s" : ""} available to match against` },
            ].map((tip, i) => (
              <div className="ai-tip" key={i}>
                <span className="material-symbols-outlined">{tip.icon}</span>
                {tip.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="ai-loading-state">
          <div className="ai-loading-spinner" />
          <div className="ai-loading-text">Gemini AI is analyzing your resume...</div>
          <div style={{ fontSize: "0.8rem", color: "#475569" }}>
            Comparing your skills against {jobs.length} job listings
          </div>
        </div>
      )}

      {/* Results */}
      {hasAnalyzed && !loading && (
        <div className="ai-results-section">
          {summary && (
            <div className="ai-summary-box">
              <span className="material-symbols-outlined ai-summary-icon">psychology</span>
              <div className="ai-summary-text">
                <strong>AI Analysis: </strong>{summary}
              </div>
            </div>
          )}

          <div className="ai-results-header">
            <div className="ai-results-title">
              <span className="material-symbols-outlined">task_alt</span>
              Matched Jobs
            </div>
            {matches.length > 0 && (
              <div className="ai-results-count">{matches.length} matches found</div>
            )}
          </div>

          {matches.length > 0 ? (
            <div className="ai-match-cards">
              {matches.map((job) => (
                <div className="ai-match-card" key={job.id}>
                  <div className={`ai-score-ring ${getScoreClass(job.score)}`}>
                    {job.score}%
                  </div>
                  <div className="ai-match-body">
                    <div className="ai-match-top">
                      <span className="ai-match-company">{job.company}</span>
                      <span className="ai-match-role">• {job.role}</span>
                    </div>
                    <div className="ai-match-reason">"{job.reason}"</div>
                    <div className="ai-match-meta">
                      {job.location && (
                        <span className="ai-match-meta-item">
                          <span className="material-symbols-outlined">location_on</span>
                          {job.location}
                        </span>
                      )}
                      {job.experienceLevel && (
                        <span className="ai-match-meta-item">
                          <span className="material-symbols-outlined">bar_chart</span>
                          {job.experienceLevel}
                        </span>
                      )}
                      {job.salary && (
                        <span className="ai-match-meta-item">
                          <span className="material-symbols-outlined">payments</span>
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ai-match-actions">
                    {savedIds.has(job.id) ? (
                      <div className="ai-saved-tag">
                        <span className="material-symbols-outlined">bookmark_added</span>
                        Saved!
                      </div>
                    ) : (
                      <button
                        className="ai-save-btn"
                        onClick={() => handleSaveToWishlist(job)}
                        title="Save to wishlist"
                      >
                        <span className="material-symbols-outlined">bookmark_add</span>
                        Save
                      </button>
                    )}
                    {job.applicationLink && (
                      <a href={job.applicationLink.startsWith('http') ? job.applicationLink : `https://${job.applicationLink}`} target="_blank" rel="noopener noreferrer">
                        <button className="apply-btn-new" style={{ fontSize: "0.7rem", padding: "0.3rem 0.7rem" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_new</span>
                          Apply
                        </button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ai-empty">
              <span className="material-symbols-outlined">search_off</span>
              <p>No strong matches found. Try adding more skills to your resume or update your job listings.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIMatch;
