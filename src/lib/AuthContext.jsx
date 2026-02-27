import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({ id: 'sportsphere', public_settings: {} });

  useEffect(() => {
    // Official Supabase v2 pattern: onAuthStateChange fires INITIAL_SESSION
    // at startup (with or without a session), SIGNED_IN on magic link / OAuth,
    // TOKEN_REFRESHED on refresh, SIGNED_OUT on logout.
    // This avoids the race condition where getSession() resolves before the
    // magic-link hash is processed and the SIGNED_IN event is missed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser) => {
    setIsLoadingAuth(true);
    try {
      // maybeSingle() returns null instead of throwing when the profile doesn't exist yet
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        setUser({ ...profile, id: authUser.id, email: authUser.email });
      } else {
        // No profile yet — try to create one
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || '',
            avatar_url: authUser.user_metadata?.avatar_url || '',
          })
          .select()
          .maybeSingle();

        if (newProfile) {
          setUser({ ...newProfile, id: authUser.id, email: authUser.email });
        } else {
          // INSERT may have failed because the trigger already created the profile — re-fetch
          const { data: retried } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          setUser({ ...(retried || {}), id: authUser.id, email: authUser.email });
        }
      }
    } catch (error) {
      console.error('loadUserProfile failed:', error);
      // Auth is valid even if profile fetch fails — set minimal user so the app can load
      setUser({ id: authUser.id, email: authUser.email });
    } finally {
      // Always complete auth — the session is real regardless of profile DB state
      setIsAuthenticated(true);
      setAuthError(null);
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const checkAppState = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUserProfile(session.user);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
