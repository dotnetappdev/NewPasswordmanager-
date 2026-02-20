import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { logout } from '../services/AuthService';

interface AuthContextValue {
  user: User | null;
  masterKey: string | null;
  isAuthenticated: boolean;
  signIn: (user: User, masterKey: string) => void;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
  updateMasterKey: (key: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [masterKey, setMasterKey] = useState<string | null>(null);

  const signIn = useCallback((newUser: User, key: string) => {
    setUser(newUser);
    setMasterKey(key);
  }, []);

  const signOut = useCallback(async () => {
    if (user) {
      await logout(user.id);
    }
    setUser(null);
    setMasterKey(null);
  }, [user]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const updateMasterKey = useCallback((key: string) => {
    setMasterKey(key);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        masterKey,
        isAuthenticated: user !== null,
        signIn,
        signOut,
        updateUser,
        updateMasterKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
