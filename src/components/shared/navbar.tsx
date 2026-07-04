"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-border-color sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-primary flex items-center gap-2 text-xl font-bold">
              <Sparkles className="text-primary h-6 w-6 animate-pulse" />
              <span>Sprinkles</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="hover:text-primary text-sm font-medium text-gray-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#mentorship"
              className="hover:text-primary text-sm font-medium text-gray-600 transition-colors"
            >
              AI Mentorship
            </Link>
            <Link
              href="#pricing"
              className="hover:text-primary text-sm font-medium text-gray-600 transition-colors"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/auth/signin"
              className="hover:text-primary flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 transition-colors"
            >
              <User className="h-4 w-4" />
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-primary hover:bg-primary-hover flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:translate-y-[-1px]"
            >
              Start Free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hover:text-primary inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-border-color border-b bg-white md:hidden"
          >
            <div className="space-y-1 px-4 pt-2 pb-4">
              <Link
                href="#features"
                onClick={() => setIsOpen(false)}
                className="hover:text-primary block py-2 text-base font-medium text-gray-600"
              >
                Features
              </Link>
              <Link
                href="#mentorship"
                onClick={() => setIsOpen(false)}
                className="hover:text-primary block py-2 text-base font-medium text-gray-600"
              >
                AI Mentorship
              </Link>
              <Link
                href="#pricing"
                onClick={() => setIsOpen(false)}
                className="hover:text-primary block py-2 text-base font-medium text-gray-600"
              >
                Pricing
              </Link>
              <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                <Link
                  href="/auth/signin"
                  onClick={() => setIsOpen(false)}
                  className="hover:text-primary flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2.5 text-base font-medium text-gray-600"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsOpen(false)}
                  className="bg-primary hover:bg-primary-hover flex items-center justify-center gap-1 rounded-lg py-2.5 text-base font-medium text-white"
                >
                  Start Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
