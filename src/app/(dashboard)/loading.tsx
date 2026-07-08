import { Sparkles } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center space-y-4">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-75"></div>
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Sprinkles is thinking...</h3>
        <p className="text-sm text-gray-500">Preparing your personalized dashboard.</p>
      </div>
    </div>
  );
}
