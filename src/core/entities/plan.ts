export interface LearningPlan {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  tasksJson: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    type: "vocabulary" | "pronunciation" | "speech" | "interview";
  }>;
  status: "active" | "completed" | "archived";
  targetCompletionDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
