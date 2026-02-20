import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import MainScreen from '../screens/MainScreen';
import VaultDetailScreen from '../screens/VaultDetailScreen';
import EntryDetailScreen from '../screens/EntryDetailScreen';
import AddEditEntryScreen from '../screens/AddEditEntryScreen';
import PasswordGeneratorScreen from '../screens/PasswordGeneratorScreen';
import SettingsScreen from '../screens/SettingsScreen';

import type { RootStackParamList, MainTabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1e1e3f' : '#fff',
          borderTopColor: isDark ? '#2d2d5f' : '#e2e8f0',
          paddingBottom: 6,
          height: 60,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: isDark ? '#475569' : '#94a3b8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="VaultList"
        component={MainScreen}
        options={{
          tabBarLabel: 'Vaults',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PasswordGenerator"
        component={PasswordGeneratorScreen}
        options={{
          tabBarLabel: 'Generator',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shuffle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: '#6366f1',
          background: isDark ? '#0f0f23' : '#f8fafc',
          card: isDark ? '#1e1e3f' : '#fff',
          text: isDark ? '#e2e8f0' : '#1e293b',
          border: isDark ? '#2d2d5f' : '#e2e8f0',
          notification: '#ef4444',
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: isDark ? '#0f0f23' : '#f8fafc',
          },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="VaultDetail" component={VaultDetailScreen} />
            <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
            <Stack.Screen name="AddEditEntry" component={AddEditEntryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
