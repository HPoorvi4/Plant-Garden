import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Styles/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  // Load remembered credentials
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isRegister && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const users = JSON.parse(localStorage.getItem("users")) || [];

      if (isRegister) {
        // Registration logic
        if (users.find((u) => u.email === email)) {
          setErrors({ email: "User already exists with this email" });
          return;
        }

        const newUser = {
          email,
          password, // In production, hash the password!
          createdAt: new Date().toISOString(),
          profile: {
            name: email.split("@")[0],
            joinDate: new Date().toISOString(),
            totalPlanted: 0,
            totalHarvested: 0,
          },
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        // Auto-login after registration
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        }

        showSuccess("Account created successfully! Welcome to Virtual Garden!");
        navigate("/garden");
      } else {
        // Login logic
        const user = users.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("currentUser", JSON.stringify(user));

          if (rememberMe) {
            localStorage.setItem("rememberedEmail", email);
          } else {
            localStorage.removeItem("rememberedEmail");
          }

          showSuccess("Welcome back to your garden!");
          navigate("/garden");
        } else {
          setErrors({
            general: "Invalid email or password. Please try again.",
          });
        }
      }
    } catch (error) {
      setErrors({
        general: "Something went wrong. Please try again.",
      });
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (message) => {
    // You could integrate with a toast system here
    console.log("Success:", message);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
    setPassword("");
    setConfirmPassword("");
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "" };

    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength++;
    else feedback.push("at least 8 characters");

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push("uppercase letter");

    if (/[0-9]/.test(password)) strength++;
    else feedback.push("number");

    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push("special character");

    const strengthTexts = ["Weak", "Fair", "Good", "Strong"];
    const strengthText = strengthTexts[Math.min(strength - 1, 3)] || "Weak";

    return {
      strength,
      text: strengthText,
      feedback:
        feedback.length > 0 ? `Add ${feedback.join(", ")}` : "Great password!",
    };
  };

  const passwordStrength = isRegister ? getPasswordStrength(password) : null;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="garden-logo">
            <span className="logo-icon">🌿</span>
            <h1>Virtual Garden</h1>
          </div>
          <p className="login-subtitle">
            {isRegister
              ? "Create your garden account"
              : "Welcome back, gardener!"}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "error" : ""}
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "error" : ""}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}

            {/* Password strength indicator for registration */}
            {isRegister && password && (
              <div className="password-strength">
                <div
                  className={`strength-bar strength-${passwordStrength.strength}`}
                >
                  <div className="strength-fill"></div>
                </div>
                <span
                  className={`strength-text strength-${passwordStrength.strength}`}
                >
                  {passwordStrength.text}
                </span>
                <small className="strength-feedback">
                  {passwordStrength.feedback}
                </small>
              </div>
            )}
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "error" : ""}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {!isRegister && (
            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>
          )}

          <button
            type="submit"
            className={`submit-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                {isRegister ? "Creating Account..." : "Signing In..."}
              </>
            ) : (
              <>
                <span className="btn-icon">{isRegister ? "🌱" : "🚪"}</span>
                {isRegister ? "Create Account" : "Sign In"}
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              className="link-button"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isRegister ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>

        {/* Demo credentials for easy testing */}
        <div className="demo-section">
          <details>
            <summary>🎮 Demo Credentials</summary>
            <div className="demo-creds">
              <p>
                <strong>Email:</strong> demo@garden.com
              </p>
              <p>
                <strong>Password:</strong> demo123
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail("demo@garden.com");
                  setPassword("demo123");
                }}
                className="demo-fill-btn"
                disabled={isLoading}
              >
                Fill Demo Credentials
              </button>
            </div>
          </details>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="login-bg-decoration">
        <div className="floating-plant plant-1">🌱</div>
        <div className="floating-plant plant-2">🌿</div>
        <div className="floating-plant plant-3">🌸</div>
        <div className="floating-plant plant-4">🌼</div>
        <div className="floating-plant plant-5">🌺</div>
      </div>
    </div>
  );
}
