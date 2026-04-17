import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

const BASE_URL = `${(process.env.REACT_APP_API_URL || "").replace("/api", "")}/auth`;

export default function Register({ onRegisterSuccess, setShowRegister }) {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 1: Submit registration form → backend sends OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) { setError("Passwords do not match!"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (!termsAccepted) { setError("Please accept the Terms of Service to continue."); return; }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/register`, { email, password, fullName });
      setSuccess("OTP sent to your email! Check your inbox.");
      setStep("otp");
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP → get JWT token and login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) { setError("Please enter the 6-digit OTP."); return; }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userEmail", response.data.email);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("fullName", response.data.fullName);
      setSuccess("Account verified! Redirecting...");
      setTimeout(() => onRegisterSuccess(), 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setSuccess("");
    try {
      await axios.post(`${BASE_URL}/resend-otp`, { email });
      setSuccess("New OTP sent! Check your inbox.");
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>

      <div className="register-grid">
        {/* Left: Editorial */}
        <div className="register-editorial">
          <span className="register-editorial-tag">The Intelligent Luminary</span>
          <h1 className="register-editorial-title">
            Join the Elite<br />Network of<br />JobFlow AI.
          </h1>
          <p className="register-editorial-desc">
            Experience a high-performance workspace designed to illuminate your
            career trajectory through data-driven precision.
          </p>
          <div className="register-features">
            <div className="register-feature">
              <div className="register-feature-icon">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div><h4>Automated Insights</h4><p>Real-time tracking of application health.</p></div>
            </div>
            <div className="register-feature">
              <div className="register-feature-icon">
                <span className="material-symbols-outlined">security</span>
              </div>
              <div><h4>Privacy First</h4><p>Your career data is encrypted and secure.</p></div>
            </div>
            <div className="register-feature">
              <div className="register-feature-icon">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <div><h4>Career Analytics</h4><p>Deep-dive insights into your job hunt.</p></div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="register-form-wrap">
          <div className="auth-card register-card">
            <div className="register-logo">
              <span className="material-symbols-outlined">blur_on</span>
              <span>JobFlow AI</span>
            </div>

            {/* ---- STEP: Registration Form ---- */}
            {step === "form" && (
              <>
                <h2>Create your account</h2>
                <p className="register-subtitle">Start your intelligent job hunt today.</p>

                {error && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}

                <form onSubmit={handleRegister} className="auth-form">
                  <div className="auth-field">
                    <label htmlFor="reg-name">Full Name</label>
                    <div className="auth-input-wrap">
                      <span className="material-symbols-outlined auth-input-icon">person</span>
                      <input id="reg-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="reg-email">Email Address</label>
                    <div className="auth-input-wrap">
                      <span className="material-symbols-outlined auth-input-icon">mail</span>
                      <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
                    </div>
                  </div>

                  <div className="auth-field-grid">
                    <div className="auth-field">
                      <label htmlFor="reg-password">Password</label>
                      <div className="auth-input-wrap">
                        <span className="material-symbols-outlined auth-input-icon">lock</span>
                        <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label htmlFor="reg-confirm">Confirm</label>
                      <div className="auth-input-wrap">
                        <span className="material-symbols-outlined auth-input-icon">lock_clock</span>
                        <input id="reg-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                      </div>
                    </div>
                  </div>

                  <div className="auth-terms">
                    <input type="checkbox" id="reg-terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                    <label htmlFor="reg-terms">
                      I agree to the <span className="auth-link-text">Terms of Service</span> and <span className="auth-link-text">Privacy Policy</span>
                    </label>
                  </div>

                  <button type="submit" disabled={loading} className="auth-submit-btn">
                    {loading ? (
                      <span className="auth-loading"><span className="auth-spinner"></span>Sending OTP...</span>
                    ) : (
                      <><span>Send Verification Code</span><span className="material-symbols-outlined">arrow_forward</span></>
                    )}
                  </button>
                </form>

                <div className="auth-switch">
                  <p>Already have an account?<span onClick={() => setShowRegister && setShowRegister(false)}>Login here</span></p>
                </div>
              </>
            )}

            {/* ---- STEP: OTP Verification ---- */}
            {step === "otp" && (
              <>
                <h2>Verify your email</h2>
                <p className="register-subtitle">
                  A 6-digit code was sent to <strong style={{ color: "var(--primary)" }}>{email}</strong>
                </p>

                {error && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}

                <form onSubmit={handleVerifyOtp} className="auth-form">
                  <div className="auth-field">
                    <label htmlFor="otp-input">Verification Code</label>
                    <div className="auth-input-wrap">
                      <span className="material-symbols-outlined auth-input-icon">pin</span>
                      <input
                        id="otp-input"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        required
                        style={{ letterSpacing: "0.3em", fontSize: "1.25rem", fontWeight: 700, textAlign: "center" }}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="auth-submit-btn">
                    {loading ? (
                      <span className="auth-loading"><span className="auth-spinner"></span>Verifying...</span>
                    ) : (
                      <><span>Verify & Activate</span><span className="material-symbols-outlined">verified</span></>
                    )}
                  </button>
                </form>

                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.8125rem", color: "var(--on-surface-variant)" }}>
                    Didn't receive the code?{" "}
                    <button
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0}
                      style={{
                        background: "none", border: "none", cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                        color: resendCooldown > 0 ? "var(--outline)" : "var(--primary)",
                        fontWeight: 700, fontSize: "0.8125rem", padding: 0,
                      }}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </p>
                  <button
                    onClick={() => { setStep("form"); setError(""); setOtp(""); }}
                    style={{ marginTop: "0.5rem", background: "none", border: "none", color: "var(--outline)", fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    ← Change email address
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
