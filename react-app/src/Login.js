import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

const API_URL = `${(process.env.REACT_APP_API_URL || "").replace("/api", "")}/auth`;

export default function Login({ onLoginSuccess, setShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState("email"); // "email" | "otp"
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/forgot-password`, { email });
      setSuccess("Reset OTP sent to your email!");
      setForgotStep("otp");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
      setSuccess("Password reset successfully! Please login with your new password.");
      setShowForgot(false);
      setForgotStep("email");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. Check OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>

      <main className="auth-main">
        <div className="auth-logo">
          <span className="material-symbols-outlined auth-logo-icon">blur_on</span>
          <h1 className="auth-logo-text">JobFlow AI</h1>
        </div>
        <p className="auth-logo-sub">Intelligent Luminary Portal</p>

        <div className="auth-card">
          {!showForgot ? (
            <>
              <div className="auth-card-header">
                <h2>Welcome Back</h2>
                <p>Sign in to your intelligent job pipeline.</p>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}

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
                    <button 
                      type="button" 
                      className="auth-forgot"
                      onClick={() => { setShowForgot(true); setError(""); setSuccess(""); }}
                    >
                      Forgot Password?
                    </button>
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
            </>
          ) : (
            <>
              <div className="auth-card-header">
                <h2>Reset Password</h2>
                <p>{forgotStep === "email" ? "Enter your email to receive a reset code." : "Enter the OTP and your new password."}</p>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}

              {forgotStep === "email" ? (
                <form onSubmit={handleInitiateReset} className="auth-form">
                  <div className="auth-field">
                    <label htmlFor="reset-email">Email Address</label>
                    <div className="auth-input-wrap">
                      <span className="material-symbols-outlined auth-input-icon">mail</span>
                      <input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="auth-submit-btn">
                    {loading ? "Sending..." : "Send Reset Code"}
                  </button>
                  <button type="button" className="auth-switch" onClick={() => setShowForgot(false)} style={{ background: "none", border: "none", marginTop: "1rem", color: "var(--primary)", cursor: "pointer" }}>
                    Back to Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteReset} className="auth-form">
                  <div className="auth-field">
                    <label htmlFor="reset-otp">6-Digit OTP</label>
                    <div className="auth-input-wrap">
                      <span className="material-symbols-outlined auth-input-icon">pin</span>
                      <input
                        id="reset-otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        required
                      />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label htmlFor="reset-new-password">New Password</label>
                    <div className="auth-input-wrap">
                      <span className="material-symbols-outlined auth-input-icon">lock</span>
                      <input
                        id="reset-new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="auth-submit-btn">
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                  <button type="button" className="auth-switch" onClick={() => setForgotStep("email")} style={{ background: "none", border: "none", marginTop: "1rem", color: "var(--primary)", cursor: "pointer" }}>
                    Change Email
                  </button>
                </form>
              )}
            </>
          )}

          <div className="auth-security">
            <div className="auth-security-inner">
              <span className="material-symbols-outlined auth-security-icon" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <p>SECURED VIA <strong>MULTI-USER JWT AUTHENTICATION</strong>.</p>
            </div>
          </div>
        </div>

        <p className="auth-footer-link">
          New to the flow? <span onClick={() => setShowRegister(true)}>Register here</span>
        </p>
      </main>
    </div>
  );
}
