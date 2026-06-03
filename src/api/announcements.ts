import apiClient from './client';
import adminClient from './adminClient';
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../types/announcements';

export const announcementsApi = {
  // Public — returns the first active announcement (null if none)
  getActive: async (): Promise<Announcement | null> => {
    const res = await apiClient.get<Announcement[]>('/announcements/active');
    return res.data?.[0] ?? null;
  },

  // Admin CRUD
  list: async (): Promise<Announcement[]> => {
    const res = await adminClient.get<Announcement[]>('/admin/v1/announcements');
    return res.data;
  },

  create: async (req: CreateAnnouncementRequest): Promise<Announcement> => {
    const res = await adminClient.post<Announcement>('/admin/v1/announcements', req);
    return res.data;
  },

  update: async (id: string, req: UpdateAnnouncementRequest): Promise<Announcement> => {
    const res = await adminClient.patch<Announcement>(`/admin/v1/announcements/${id}`, req);
    return res.data;
  },

  setActive: async (id: string, active: boolean): Promise<Announcement> => {
    const res = await adminClient.put<Announcement>(`/admin/v1/announcements/${id}/active`, {
      active,
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await adminClient.delete(`/admin/v1/announcements/${id}`);
  },
};
