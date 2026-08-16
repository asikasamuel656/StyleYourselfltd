import posthog from "posthog-js";

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,

  capture_pageview: true,
  capture_pageleave: true,

  person_profiles: "identified_only",
});

export default posthog;