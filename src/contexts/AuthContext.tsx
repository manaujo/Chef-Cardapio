import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthState } from '../hooks/useAuth';
import { AuthError } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name: string) => Promise<{
    data: any;
    error: AuthError | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    data: any;
    error: AuthError | null;
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};