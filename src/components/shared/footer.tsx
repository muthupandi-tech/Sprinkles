import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-border-color mt-auto w-full border-t bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="text-primary flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5" />
            <span>Sprinkles</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <Link href="#features" className="hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#mentorship" className="hover:text-primary transition-colors">
              AI Mentorship
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <p className="flex items-center gap-1 text-sm text-gray-400">
            <span>© {new Date().getFullYear()} Sprinkles. Built with</span>
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            <span>for students.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
