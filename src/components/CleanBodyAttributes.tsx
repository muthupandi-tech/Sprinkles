"use client";

import { useEffect } from "react";

export default function CleanBodyAttributes() {
  useEffect(() => {
    const cleanup = () => {
      const body = document.body;
      if (body) {
        body.removeAttribute("data-new-gr-c-s-check-loaded");
        body.removeAttribute("data-gr-ext-installed");
      }
    };
    cleanup();
    const observer = new MutationObserver(() => {
      cleanup();
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-new-gr-c-s-check-loaded", "data-gr-ext-installed"],
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
