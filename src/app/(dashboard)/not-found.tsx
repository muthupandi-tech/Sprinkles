import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-500 shadow-sm ring-1 ring-gray-200">
        <FileQuestion className="h-10 w-10" />
      </div>
      <div className="max-w-md space-y-2 text-center">
        <h3 className="text-2xl font-bold text-gray-900">Page not found</h3>
        <p className="text-sm text-gray-500">
          We couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md active:scale-95"
      >
        <Home className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
