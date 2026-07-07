import { AssistantClient } from "./assistant-client";

export const metadata = {
  title: "Personal Assistant | Sprinkles",
  description: "Your personalized AI study planner and calendar.",
};

export default function AssistantPage() {
  return (
    <div className="flex h-full flex-col">
      <AssistantClient />
    </div>
  );
}
