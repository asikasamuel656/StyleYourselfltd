import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";

import { auth } from "../../firebase.js";

const ADMIN_EMAIL = "asikasamuel656@gmail.com";

export default function VerifyMagicLink() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    async function verify() {
      try {
        const link = window.location.href;

        if (!isSignInWithEmailLink(auth, link)) {
          setStatus("Invalid sign in link");
          return;
        }

        let email = localStorage.getItem("emailForSignIn");

        if (!email) {
          email = window.prompt(
            "Please enter your email to complete sign in"
          );
        }

        if (!email) {
          setStatus("Email required");
          return;
        }

        const result = await signInWithEmailLink(
          auth,
          email,
          link
        );

        localStorage.removeItem("emailForSignIn");

        if (
          result.user.email?.toLowerCase() !==
          ADMIN_EMAIL.toLowerCase()
        ) {
          setStatus("Unauthorized email");
          return;
        }

        navigate("/manage/dashboard");
      } catch (err) {
        console.error(err);
        setStatus("Sign in failed");
      }
    }

    verify();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h2>{status}</h2>
    </div>
  );
}