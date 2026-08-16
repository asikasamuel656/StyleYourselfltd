import { useState, useEffect } from "react";
import { auth } from "../../firebase.js";
import { useNavigate } from "react-router-dom";
import { ADMIN_EMAIL } from "../config/adminConfig.js";
import StyleYourself from "../../assets/StyleYourself.jpg"
import { Link,} from "react-router-dom";

// import S

import {
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";

const GOLD = "#F59E0B";
const GOLD_DARK = "#D97706";

const DARK = {
  bg: "#111827",
  surface: "#1F2937",
  border: "#374151",
  text: "#F9FAFB",
  muted: "#9CA3AF",
  sub: "#6B7280",
  input: "#111827",
  inputBorder: "#374151",
};

const LIGHT = {
  bg: "#F9FAFB",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  muted: "#6B7280",
  sub: "#9CA3AF",
  input: "#F9FAFB",
  inputBorder: "#D1D5DB",
};

// Maps raw Firebase Auth error codes to short, human-readable messages.
// Firebase's default err.message looks like:
//   "Firebase: Error (auth/invalid-credential)."
// which is meaningless to an end user. This strips all of that away.
function getFriendlyAuthError(err) {
  const code = err?.code || "";

  const messages = {
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/invalid-email": "Invalid email address.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "No internet connection. Please check your network and try again.",
    "auth/internal-error": "Something went wrong. Please try again.",
  };

  return messages[code] || "Something went wrong. Please try again.";
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [dark] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 420);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 420);
    };

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

async function handleSubmit() {
  setError("");
  setMessage("");

  const emailValue = email.trim();

  if (!emailValue || !password) {
    setError("Please enter email and password.");
    return;
  }

  setStep("sending");

  try {
    await setPersistence(
      auth,
      browserSessionPersistence
    );

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        emailValue,
        password
      );


    const user = userCredential.user;

    if (
      user.email.toLowerCase() !==
      ADMIN_EMAIL.toLowerCase()
    ) {
      setError(
        "You are not authorized to access the admin panel."
      );
      return;
    }

    setMessage("Login successful!");

    sessionStorage.setItem(
      "adminLoggedIn",
      "true"
    );

    navigate("/manage/dashboard");
    } catch (err) {
      setError(getFriendlyAuthError(err));
    } finally {
      setStep("idle");
    }
}
  const T = dark ? DARK : LIGHT;

  const timeStr =
    now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const dateStr =
    now.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const inputStyle = {
    width: "100%",
    background: T.input,
    border: `1px solid ${T.inputBorder}`,
    borderRadius: 10,
    padding: "12px 16px",
    color: T.text,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  const btnPrimary = {
    width: "100%",
    padding: "13px 20px",
    borderRadius: 10,
    border: "none",
    cursor:
      step === "sending"
        ? "not-allowed"
        : "pointer",
    background:
      step === "sending"
        ? T.border
        : `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
    color:
      step === "sending"
        ? T.muted
        : "#fff",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.02em",
    boxShadow:
      step === "sending"
        ? "none"
        : `0 2px 16px ${GOLD}44`,
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        fontFamily:
          "'Inter', 'DM Sans', sans-serif",
        background: T.bg,
        minHeight: "100vh",
        color: T.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          padding: isMobile
            ? "12px 14px"
            : "14px 28px",
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
            <div className="flex items-center gap-3 cursor-pointer">
  {/* Logo */}
  <div className="relative flex-shrink-0">
    <div className="logo-ring"></div>

    <div
      className="
        relative
        w-11
        h-11
        md:w-12
        md:h-12
        rounded-full
        overflow-hidden
        border-2
        border-yellow-500
        bg-black
        shadow-lg
      "
    >
      <img
        src={StyleYourself}
        alt="Style Yourself"
        className="w-full h-full object-cover"
      />
    </div>
  </div>

  {/* Brand Text */}
  <Link to="/">
    <div className="flex flex-col justify-center">
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: "#111827",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
        }}
      >
        StyleYourself
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 9,
          color: T.muted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        Admin Panel
      </div>
    </div>
  </Link>
</div>
</div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: isMobile
                ? 13
                : 15,
              fontWeight: 700,
              color: GOLD,
            }}
          >
            {timeStr}
          </div>

          {!isMobile && (
            <div
              style={{
                fontSize: 10,
                color: T.muted,
              }}
            >
              {dateStr}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: "40px 36px",
            width: "100%",
            maxWidth: 420,
          }}
        >
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              margin: "0 0 8px",
            }}
          >
            Admin{" "}
            <span
              style={{
                color: GOLD,
              }}
            >
              Login ✦
            </span>
          </h1>

          <p
            style={{
              fontSize: 13,
              color: T.muted,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Enter your admin credentials to access the dashboard.
          </p>

          <div
            style={{
              marginTop: 24,
              marginBottom: 20,
            }}
          >
            <label
              style={{
                fontSize: 10,
                color: T.muted,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform:
                  "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Email Address
            </label>

            <input
              style={inputStyle}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          </div>

              <div
          style={{
            marginTop: 16,
          }}
        >
          <label
            style={{
              fontSize: 10,
              color: T.muted,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 6,
            }}
          >
            Password
          </label>

          <input
            style={inputStyle}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </div>
          {error && (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      padding: "14px 16px",
      marginTop: "15px",
      borderRadius: "14px",
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      boxShadow: "0 8px 20px rgba(239,68,68,0.08)",
      animation: "slideDown .35s ease",
    }}
  >
    <div
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        background: "#EF4444",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        flexShrink: 0,
      }}
    >
      ⚠️
    </div>

    <div>
      <div
        style={{
          fontWeight: 700,
          color: "#991B1B",
          marginBottom: 4,
        }}
      >
        Couldn't sign in
      </div>

      <div
        style={{
          color: "#7F1D1D",
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.5,
        }}
      >
        {error}
      </div>
    </div>
  </div>
)}

{message && (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      padding: "14px 16px",
      marginBottom: "18px",
      borderRadius: "14px",
      background: "#ECFDF5",
      border: "1px solid #BBF7D0",
      boxShadow: "0 8px 20px rgba(34,197,94,.08)",
      animation: "slideDown .35s ease",
    }}
  >
    <div
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        background: "#22C55E",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        flexShrink: 0,
      }}
    >
      ✓
    </div>

    <div>
      <div
        style={{
          fontWeight: 700,
          color: "#166534",
          marginBottom: 4,
        }}
      >
        Success
      </div>

      <div
        style={{
          color: "#15803D",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {message}
      </div>
    </div>
  </div>
)}

          <button
          style={btnPrimary}
          className="mt-5"
          onClick={handleSubmit}
          disabled={step === "sending"}
        >
          {step === "sending"
            ? "✦ Signing In..."
            : "✦ Sign In"}
        </button>
        </div>
      </div>
    </div>
  );
}