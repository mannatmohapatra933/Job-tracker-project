import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

const API_URL = `${(process.env.REACT_APP_API_URL || "").replace("/api", "")}/auth`;

export default function Login({ onLoginSuccess, setShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userEmail", response.data.email);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("fullName", response.data.fullName);
      setEmail("");
      setPassword("");
      onLoginSuccess();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (typeof err.response?.data === "string") {
        setError(err.response.data);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>

      <main className="auth-main">
        {/* Logo */}
        <div className="auth-logo">
          <span className="material-symbols-outlined auth-logo-icon">blur_on</span>
          <h1 className="auth-logo-text">JobFlow AI</h1>
        </div>
        <p className="auth-logo-sub">Intelligent Luminary Portal</p>

        {/* Glass Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your intelligent job pipeline.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="material-symbols-outlined auth-input-icon">mail</span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-field-row">
                <label htmlFor="login-password">Password</label>
                <button type="button" className="auth-forgot">Forgot Password?</button>
              </div>
              <div className="auth-input-wrap">
                <span className="material-symbols-outlined auth-input-icon">lock</span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? (
                <span className="auth-loading">
                  <span className="auth-spinner"></span>
                  Signing in...
                </span>
              ) : (
                "Access Terminal"
              )}
            </button>
          </form>

          {/* Security Badge */}
          <div className="auth-security">
            <div className="auth-security-inner">
              <span
                className="material-symbols-outlined auth-security-icon"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <p>
                SECURED VIA{" "}
                <strong>MULTI-USER JWT AUTHENTICATION</strong>.
                ENCRYPTED END-TO-END FLOW SESSIONS.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="auth-footer-link">
          New to the flow?
          <span onClick={() => setShowRegister(true)}>Register here</span>
        </p>

        {/* Aesthetic footnote */}
        <div className="auth-footnote">
          <div className="auth-footnote-line"></div>
          <div className="auth-footnote-icons">
            <span className="material-symbols-outlined">monitoring</span>
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="material-symbols-outlined">security</span>
          </div>
          <div className="auth-footnote-line"></div>
        </div>
      </main>
    </div>
  );
}
