import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authService, dbService } from '../lib/supabaseClient';
import { AirparkUser } from '../types';

type SignResult = { error: any | null; signedIn?: boolean };

type SignUpPayload = {
  fullName: string;
  phone: string;
  nif: string;
  role: string;
  profile: string;
};

type AuthContextType = {
  user: AirparkUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignResult>;
  signUp: (email: string, password: string, payload: SignUpPayload) => Promise<SignResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AirparkUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoading(true);

      try {
        const { user: currentUser } = await authService.getCurrentUser();

        if (currentUser) {
          const { data: profile } = await dbService.getUser(currentUser.id);
          if (mounted) setUser(profile || null);
        } else {
          if (mounted) setUser(null);
        }
      } catch (e) {
        console.error('AuthProvider init error:', e);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();

    // Subscribe to auth state changes so the app updates if session changes elsewhere
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const { data: profile } = await dbService.getUser(session.user.id);
          if (mounted) setUser(profile || null);
        } else {
          if (mounted) setUser(null);
        }
      } catch (e) {
        console.error('onAuthStateChange error:', e);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      // unsubscribe
      try {
        data?.subscription?.unsubscribe();
      } catch (_e) {
        // noop
      }
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<SignResult> => {
    try {
      const { data, error } = await authService.login(email, password);
      if (error || !data?.user) return { error };

      const { data: profile, error: profileError } = await dbService.getUser(data.user.id);
      if (profileError) return { error: profileError };

      setUser(profile || null);
      return { error: null, signedIn: true };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    payload: SignUpPayload
  ): Promise<SignResult> => {
    try {
      const { data, error } = await authService.register(email, password, payload);
      if (error) return { error };

      // Try to sign in automatically after register (best-effort)
      const { data: loginData, error: loginError } = await authService.login(email, password);
      if (loginError || !loginData?.user) {
        // registration succeeded but no session available (e.g. email confirmation required)
        // return success (null error) and allow UI to inform user if needed
        return { error: null, signedIn: false };
      }

      const { data: profile, error: profileError } = await dbService.getUser(loginData.user.id);
      if (profileError) return { error: profileError };

      setUser(profile || null);
      return { error: null, signedIn: true };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('signOut error:', e);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}