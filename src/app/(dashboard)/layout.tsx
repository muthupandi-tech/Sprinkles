import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Home, Sparkles, Mic, BarChart2, User, Settings, LogOut, Flame } from "lucide-react";
import { getDashboardData } from "../actions/profile";
import { signOut } from "../auth/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Load basic details for user details display
  const profileRes = await getDashboardData();
  const profile = profileRes.success ? profileRes.profile : null;
  const progress = profileRes.success ? profileRes.progress : null;

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
    { label: "Practice", href: "/practice", icon: Mic },
    { label: "Analytics", href: "/analytics", icon: BarChart2 },
    { label: "Achievements", href: "/achievements", icon: Flame },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      {/* Sidebar - Desktop */}
      <aside className="fixed top-0 bottom-0 left-0 z-40 hidden w-64 justify-between border-r border-gray-100 bg-white shadow-sm md:flex md:flex-col">
        <div>
          {/* Logo Brand Header */}
          <div className="flex h-16 items-center gap-2 border-b border-gray-50 px-6">
            <Sparkles className="h-6 w-6 animate-pulse text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">Sprinkles</span>
          </div>

          {/* Student Profile Quick View Card */}
          {profile && (
            <div className="mx-4 my-6 rounded-2xl border border-blue-100/30 bg-blue-50/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {profile.fullName?.charAt(0).toUpperCase() || "S"}
                </div>
                <div className="overflow-hidden">
                  <h4 className="truncate text-sm font-bold text-gray-900">
                    {profile.fullName || "Student"}
                  </h4>
                  <p className="truncate text-xs font-medium text-gray-500">
                    {profile.englishProficiency} • {profile.preferredAccent}
                  </p>
                </div>
              </div>

              {progress && (
                <div className="mt-4 flex items-center justify-between border-t border-blue-100/40 pt-3 text-xs">
                  <div className="flex items-center gap-1 font-semibold text-orange-600">
                    <Flame className="h-3.5 w-3.5 fill-current" />
                    <span>{progress.currentStreak} Day Streak</span>
                  </div>
                  <div className="font-semibold text-blue-700">
                    Score: {progress.overallScore.toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sidebar Nav Items */}
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:text-blue-600"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Log out */}
        <div className="border-t border-gray-50 p-4">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Top App Header Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm md:hidden">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-gray-900">Sprinkles</span>
        </div>
        <div className="flex items-center gap-3">
          {progress && (
            <div className="flex items-center gap-1 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>{progress.currentStreak}d</span>
            </div>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {profile?.fullName?.charAt(0).toUpperCase() || "S"}
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex min-h-screen flex-col bg-[#f8fafc] pb-20 md:pb-0 md:pl-64">
        <div className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="pb-safe fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t border-gray-100 bg-white px-2 shadow-lg md:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-1 text-gray-500 transition-colors hover:text-blue-600"
            >
              <Icon className="h-5.5 w-5.5 shrink-0" />
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
        {/* Settings Button on Mobile Bottom Nav */}
        <Link
          href="/settings"
          className="flex flex-col items-center justify-center gap-1 py-1 text-gray-500 transition-colors hover:text-blue-600"
        >
          <Settings className="h-5.5 w-5.5 shrink-0" />
          <span className="text-[10px] font-bold tracking-tight">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
