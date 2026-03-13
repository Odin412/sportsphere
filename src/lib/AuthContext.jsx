import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({ id: 'sportsphere', public_settings: {} });

  useEffect(() => {
    let resolved = false;

    // Safety fallback: if Supabase GoTrue gets deadlocked, unblock the UI
    // and self-heal by clearing any stuck locks from local storage.
    const timer = setTimeout(() => {
      if (!resolved) {
        console.warn('Auth state check timed out, unblocking UI');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('lock:sb-')) {
            localStorage.removeItem(key);
          }
        });
        setIsLoadingAuth(false);
      }
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        resolved = true;
        if (session?.user) {
          // TOKEN_REFRESHED / USER_UPDATED are background events.
          // Don't flash the global loading spinner for them — update silently.
          const silent = event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED';
          await loadUserProfile(session.user, silent);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
        }
      }
    );

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser, silent = false) => {
    if (!silent) setIsLoadingAuth(true);

    // Safety net: never block the app for more than 8 seconds.
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('profile-timeout')), 8000)
    );

    try {
      await Promise.race([fetchAndSetProfile(authUser), timeout]);
    } catch (error) {
      if (error.message !== 'profile-timeout') {
        console.error('loadUserProfile failed:', error);
      }
      // Auth is valid even if profile fetch fails — set minimal user so the app loads.
      setUser(prev => prev || { id: authUser.id, email: authUser.email });
    } finally {
      setIsAuthenticated(true);
      setAuthError(null);
      setIsLoadingAuth(false);
    }
  };

  const fetchAndSetProfile = async (authUser) => {
    const meta = authUser.user_metadata || {};
    
    // maybeSingle() returns null (not an error) when the row doesn't exist yet.
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profile) {
      // DB trigger might have defaulted role to 'athlete', so we enforce the requested role from signup
      const correctRole = meta.role && profile.onboarding_complete === false ? meta.role : profile.role;
      setUser({ ...profile, id: authUser.id, email: authUser.email, role: correctRole });
      return;
    }

    // No profile yet — try to create one.
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: authUser.id,
        email: authUser.email,
        full_name: meta.full_name || '',
        avatar_url: meta.avatar_url || '',
        role: meta.role || 'athlete',
        ...(meta.parent_name ? { parent_name: meta.parent_name } : {}),
        ...(meta.is_parent_managed ? { is_parent_managed: true } : {}),
      })
      .select()
      .maybeSingle();

    if (newProfile) {
      setUser({ ...newProfile, id: authUser.id, email: authUser.email });
      return;
    }

    // INSERT may have failed because the DB trigger already created the profile — re-fetch.
    const { data: retried } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    setUser({ ...(retried || {}), id: authUser.id, email: authUser.email });
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Error during sign out:", e);
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user_role");
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
      setUser,
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
