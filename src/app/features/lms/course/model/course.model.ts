export interface Course {
  id?: number;
  title: string;
  code: string;
  description?: string;
  thumbnailUrl?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  durationHours?: number;
  active?: boolean;
  createdAt?: string;
}