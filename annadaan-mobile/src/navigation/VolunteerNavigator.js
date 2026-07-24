import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../utils/colors';

import VolunteerDashboard from '../screens/volunteer/VolunteerDashboard';
import AvailablePickups from '../screens/volunteer/AvailablePickups';
import UploadProof from '../screens/volunteer/UploadProof';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const PickupsStack = createNativeStackNavigator();

const VolunteerDashboardStack = () => (
  <DashboardStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.surface },
      headerTintColor: Colors.textPrimary,
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <DashboardStack.Screen name="VolunteerHome" component={VolunteerDashboard} options={{ title: 'Dashboard' }} />
    <DashboardStack.Screen name="UploadProof" component={UploadProof} options={{ title: 'Upload Proof' }} />
  </DashboardStack.Navigator>
);

const AvailablePickupsStack = () => (
  <PickupsStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.surface },
      headerTintColor: Colors.textPrimary,
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <PickupsStack.Screen name="AvailablePickupsList" component={AvailablePickups} options={{ title: 'Available Pickups' }} />
    <PickupsStack.Screen name="UploadProofFromPickups" component={UploadProof} options={{ title: 'Upload Proof' }} />
  </PickupsStack.Navigator>
);

const VolunteerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Pickups') iconName = focused ? 'bicycle' : 'bicycle-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBackground,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={VolunteerDashboardStack} />
      <Tab.Screen name="Pickups" component={AvailablePickupsStack} options={{ title: 'Available Pickups' }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTitleStyle: { fontWeight: '700', color: Colors.textPrimary },
        }}
      />
    </Tab.Navigator>
  );
};

export default VolunteerNavigator;
