'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  userName: string;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data as Profile);
      }
    } catch {
      // Ignore non-fatal profile errors
    }
  };

  useEffect(() => {
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        setIsLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initAuth();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  /**
   * Derive a display name, safe for phone-only users.
   * Priority: profile.name → user_metadata.name → masked phone → 'there'
   * Never expose the full phone number.
   */
  const userName = (() => {
    if (profile?.name) return profile.name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    if (user?.phone) {
      // Mask: "+919876543210" → "+91 •••••• 3210"
      const p = user.phone;
      const match = p.match(/^(\+\d{1,4})(\d+)$/);
      if (match) {
        const [, dial, local] = match;
        const visible = local.slice(-4);
        const hidden = '••••••';
        return `${dial} ${hidden} ${visible}`;
      }
      return 'there';
    }
    return 'there';
  })();

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        userName,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
