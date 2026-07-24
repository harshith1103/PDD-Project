import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../utils/colors';

import DonorDashboard from '../screens/donor/DonorDashboard';
import CreateDonation from '../screens/donor/CreateDonation';
import MyDonations from '../screens/donor/MyDonations';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();

const DonorDashboardStack = () => (
  <DashboardStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.surface },
      headerTintColor: Colors.textPrimary,
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <DashboardStack.Screen name="DonorHome" component={DonorDashboard} options={{ title: 'Dashboard' }} />
    <DashboardStack.Screen name="CreateDonation" component={CreateDonation} options={{ title: 'New Donation' }} />
  </DashboardStack.Navigator>
);

const DonorNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'MyDonations') iconName = focused ? 'list' : 'list-outline';
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
      <Tab.Screen name="Dashboard" component={DonorDashboardStack} />
      <Tab.Screen
        name="MyDonations"
        component={MyDonations}
        options={{
          title: 'My Donations',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTitleStyle: { fontWeight: '700', color: Colors.textPrimary },
        }}
      />
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

export default DonorNavigator;
