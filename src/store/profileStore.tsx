'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'aw_selected_profile_id';

interface ProfileContextValue {
  selectedProfileId: string | null;
  setSelectedProfileId: (id: string | null) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [selectedProfileId, setSelectedProfileIdState] = useState<string | null>(null);

  // Restore from localStorage on mount (client-only)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSelectedProfileIdState(stored);
  }, []);

  const setSelectedProfileId = useCallback((id: string | null) => {
    setSelectedProfileIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <ProfileContext.Provider value={{ selectedProfileId, setSelectedProfileId }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}
