import { getDashboardData } from "@/app/actions/profile";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient initialData={data} />;
}
