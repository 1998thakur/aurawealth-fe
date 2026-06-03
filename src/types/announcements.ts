// Matches backend: AnnouncementResponse DTO
export interface Announcement {
  id: string;
  badge?: string;
  text: string;
  cta?: string;
  href: string;
  external: boolean;
  active: boolean;
  bgColor?: string;     // 'amber' | 'blue' | 'green' | 'red' | 'purple'
  sortOrder: number;
  startsAt?: string;    // ISO timestamp — null means always visible
  endsAt?: string;      // ISO timestamp — null means never expires
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAnnouncementRequest {
  badge?: string;
  text: string;
  cta?: string;
  href: string;
  external?: boolean;
  bgColor?: string;
  sortOrder?: number;
  startsAt?: string;
  endsAt?: string;
}

export type UpdateAnnouncementRequest = Partial<CreateAnnouncementRequest> & {
  active?: boolean;
};
