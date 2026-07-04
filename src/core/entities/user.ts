export interface User {
  id: string; // Linked to Supabase Auth UID
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
