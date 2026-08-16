import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase.js";
import { ADMIN_EMAIL } from "../config/adminConfig.js";

export function useAdminAuth() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
    auth,
    async (user) => {
      const adminSession =
        sessionStorage.getItem(
          "adminLoggedIn"
        );

      if (!user || !adminSession) {
        await signOut(auth);
        setStatus("unauthorized");
        return;
      }

      if (
        user.email?.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase()
      ) {
        setStatus("authorized");
      } else {
        setStatus("unauthorized");
      }
    }
  );

    return unsubscribe;
  }, []);

  async function logout() {
  sessionStorage.removeItem(
    "adminLoggedIn"
  );

  await signOut(auth);

  window.location.href =
    "/StyleYourself/manage/login";
}

  return {
    status,
    logout,
  };
}