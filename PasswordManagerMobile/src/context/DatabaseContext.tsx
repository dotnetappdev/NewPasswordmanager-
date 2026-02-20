import React, { createContext, useContext, ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { DB } from '../services/DatabaseService';

interface DatabaseContextValue {
  db: DB;
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  return <DatabaseContext.Provider value={{ db }}>{children}</DatabaseContext.Provider>;
}

export function useDatabase(): DatabaseContextValue {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within DatabaseProvider');
  return context;
}
