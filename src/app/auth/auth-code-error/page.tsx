"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthCodeError() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="shadow-premium w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center"
      >
        <div className="mb-4 inline-flex rounded-full bg-red-50 p-3 text-red-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Authentication Error</h2>
        <p className="mt-2 mb-6 text-sm text-gray-500">
          {
            "We couldn't exchange your login code for a valid session. The link may have expired or already been used."
          }
        </p>

        <Link
          href="/auth/signin"
          className="animate-pulse-once inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </Link>
      </motion.div>
    </div>
  );
}
// Descriptive element ID for visual verification tests
export const errorPageId = "sprinkles-auth-code-error-screen";
