import { getAnalyticsData } from "../../actions/profile";
import AnalyticsClient from "./analytics-client";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  return <AnalyticsClient initialData={data} />;
}
