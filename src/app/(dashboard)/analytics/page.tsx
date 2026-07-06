import { createClient } from "@/lib/supabase/server";
import { AnalyticsService } from "@/core/services/analytics-service";
import AnalyticsClient from "./analytics-client";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const data = await AnalyticsService.getDashboardAnalytics(user.id);
  
  return <AnalyticsClient initialData={data} />;
}
