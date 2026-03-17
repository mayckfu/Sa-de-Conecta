import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { Profile, UserRole, UserStatus } from '../types/database';

// Exporting to avoid breaking other files that might be importing these from here temporarily
export type { UserRole, UserStatus, Profile };

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Ref to track the last user ID we fetched a profile for.
  // Prevents redundant fetchProfile calls when multiple auth events fire for the same user.
  const lastFetchedUserId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    // Guard: skip if we already fetched for this user to prevent infinite loops
    if (lastFetchedUserId.current === userId) {
      setLoading(false);
      return;
    }
    lastFetchedUserId.current = userId;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('[useAuth] Profile fetch failed:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      // Reset ref to force a fresh fetch
      lastFetchedUserId.current = null;
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // getSession() resolves the initial session synchronously/reliably in all environments
    // (local, Vercel, Edge). This is our single initialization point.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // onAuthStateChange listens to SUBSEQUENT changes only.
    // INITIAL_SESSION is skipped because getSession() already handles it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip the initial event — getSession() handles it
      if (event === 'INITIAL_SESSION') return;

      const currentUser = session?.user ?? null;

      if (event === 'SIGNED_OUT') {
        // Clear state immediately on logout
        lastFetchedUserId.current = null;
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED, etc.
      setUser(currentUser);

      if (currentUser && currentUser.id !== lastFetchedUserId.current) {
        // New user or different user — fetch their profile
        setLoading(true);
        lastFetchedUserId.current = null; // reset so fetchProfile runs
        fetchProfile(currentUser.id);
      } else if (!currentUser) {
        lastFetchedUserId.current = null;
        setProfile(null);
        setLoading(false);
      }
      // If same user (TOKEN_REFRESHED) → do nothing, profile already loaded
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
