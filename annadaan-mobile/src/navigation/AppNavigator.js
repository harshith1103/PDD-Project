import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import DonorNavigator from './DonorNavigator';
import VolunteerNavigator from './VolunteerNavigator';
import RecipientNavigator from './RecipientNavigator';
import AdminNavigator from './AdminNavigator';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const getRoleNavigator = (role) => {
  switch (role) {
    case 'donor':
      return DonorNavigator;
    case 'volunteer':
      return VolunteerNavigator;
    case 'recipient':
      return RecipientNavigator;
    case 'admin':
      return AdminNavigator;
    default:
      return DonorNavigator;
  }
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Starting Annadaan Connect..." />;
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
          <AppStack.Screen name="Main" component={getRoleNavigator(user.role)} />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
