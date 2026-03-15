// ============================================================
// Auth & User Types
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
}
