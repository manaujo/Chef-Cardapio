import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      })
      .catch((error) => {
        console.error('Session recovery error:', error);
        // If refresh token is invalid, clear all auth data and reload
        if (error.message && error.message.includes('Refresh Token Not Found')) {
          signOut();
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
          });
        }
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };

  const signOut = async () => {
    try {
      // Primeiro, limpar o estado local imediatamente
      setAuthState({
        user: null,
        session: null,
        loading: false,
      });
      
      // Tentar fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      // Se o erro for de sessão não encontrada, limpar o estado local mesmo assim
      if (error && error.message.includes('session_not_found')) {
        console.log('Session already expired, logout successful');
        return { error: null }; // Considerar como sucesso
      }
      
      // Limpar localStorage e sessionStorage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('Could not clear storage:', storageError);
      }
      
      // Forçar reload da página para garantir limpeza completa
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
      return { error };
    } catch (err) {
      console.error('Logout error:', err);
      // Em caso de erro, limpar estado local mesmo assim
      setAuthState({
        user: null,
        session: null,
        loading: false,
      });
      
      // Limpar storage e recarregar página
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('Could not clear storage:', storageError);
      }
      
      // Forçar reload em caso de erro
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
      return { error: null };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
}