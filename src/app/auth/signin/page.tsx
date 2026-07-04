"use client";

import Link from "next/link";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SignIn() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="shadow-premium w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8"
      >
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-primary mb-3 inline-flex items-center gap-2 text-2xl font-bold"
          >
            <Sparkles className="text-primary h-6 w-6" />
            <span>Sprinkles</span>
          </Link>
          <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-1 text-sm text-gray-500">Sign in to resume your communication lessons</p>
        </div>

        {/* OAuth Provider */}
        <button
          onClick={() => console.log("Google Sign In")}
          className="mb-6 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1 border-b border-gray-100"></div>
          <span className="text-xs font-medium text-gray-400">OR EMAIL</span>
          <div className="flex-1 border-b border-gray-100"></div>
        </div>

        {/* Email sign in */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="you@university.edu"
                className="focus:border-primary w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-sm transition-colors focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="focus:border-primary w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-sm transition-colors focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-md transition-colors"
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <span>New to Sprinkles? </span>
          <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
