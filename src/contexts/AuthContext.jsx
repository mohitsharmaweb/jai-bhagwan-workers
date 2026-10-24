import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Fetch initial active Supabase session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && mounted) {
          setCurrentUser(session.user);
          setIsAdmin(true);
        } else if (mounted) {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error fetching Supabase auth session:', err);
        if (mounted) {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen to Supabase auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setIsAdmin(true);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Admin Login - Strictly via Supabase Auth
   */
  const login = async (email, password) => {
    setAuthError(null);

    const cleanEmail = (email || '').trim();
    if (!cleanEmail || !password) {
      throw new Error('कृपया ईमेल और पासवर्ड दर्ज करें।');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('अमान्य ईमेल या पासवर्ड। कृपया अपनी सही साख दर्ज करें।');
        }
        throw new Error(error.message || 'लॉगिन विफल रहा। कृपया पुनः प्रयास करें।');
      }

      setCurrentUser(data.user);
      setIsAdmin(true);
      return { success: true, user: data.user };
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  /**
   * Admin Sign Out - Strictly via Supabase Auth
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout issue:', e);
    } finally {
      setCurrentUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      loading,
      authError,
      login,
      logout
    }}>
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
