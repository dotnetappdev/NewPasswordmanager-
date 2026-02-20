import 'react-native-get-random-values';
import React, { Suspense } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { DatabaseProvider } from './src/context/DatabaseContext';
import { initializeDatabase } from './src/services/DatabaseService';
import AppNavigator from './src/navigation/AppNavigator';

function LoadingFallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f23' }}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 14 }}>Initializing database...</Text>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Suspense fallback={<LoadingFallback />}>
        <SQLiteProvider
          databaseName="passwordmanager.db"
          onInit={initializeDatabase}
          useSuspense
        >
          <DatabaseProvider>
            <AuthProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </AuthProvider>
          </DatabaseProvider>
        </SQLiteProvider>
      </Suspense>
    </GestureHandlerRootView>
  );
}
