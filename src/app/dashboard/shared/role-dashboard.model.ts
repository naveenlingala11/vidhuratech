export interface RoleStatCard {
  label: string;
  value: string | number;
  helper: string;
  tone: string;
}
export interface RolePanelItem {
  title: string;
  description?: string;
  meta?: string;
  value?: string | number;
  progress?: number;
}
export interface RolePanel {
  eyebrow: string;
  title: string;
  type: 'list' | 'progress' | 'pipeline';
  items: RolePanelItem[];
}
export interface RoleAction {
  label: string;
  helper: string;
  tone: string;
}
