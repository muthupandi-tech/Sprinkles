"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    toast.error("An unexpected error occurred in the dashboard");
  }, [error]);

  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100">
        <AlertCircle className="h-10 w-10" />
      </div>
      <div className="max-w-md space-y-2 text-center">
        <h3 className="text-2xl font-bold text-gray-900">Something went wrong!</h3>
        <p className="text-sm text-gray-500">
          We encountered an unexpected error while loading this page. Please try refreshing or come
          back later.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95"
      >
        <RefreshCcw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
