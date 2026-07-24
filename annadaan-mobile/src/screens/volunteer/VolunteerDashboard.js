import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Colors from '../../utils/colors';
import StatCard from '../../components/analytics/StatCard';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const VolunteerDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [tasksRes, availableRes] = await Promise.all([
        api.get('/volunteers/tasks'),
        api.get('/volunteers/available-tasks'),
      ]);
      if (tasksRes.data.success) setMyTasks(tasksRes.data.data);
      if (availableRes.data.success) setAvailableTasks(availableRes.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const stats = {
    completed: myTasks.filter((t) => t.status === 'delivered').length,
    active: myTasks.filter((t) => ['matched', 'picked_up'].includes(t.status)).length,
    available: availableTasks.length,
  };

  if (loading && !refreshing) return <LoadingSpinner />;
  if (error && myTasks.length === 0) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Welcome, {user?.name?.split(' ')[0]} 🚴</Text>
        <Text style={styles.subGreeting}>Your volunteer dashboard</Text>

        <View style={styles.statsRow}>
          <StatCard label="Completed" value={stats.completed} icon="checkmark-done" color={Colors.success} />
          <StatCard label="Active" value={stats.active} icon="bicycle" color={Colors.primary} />
          <StatCard label="Available" value={stats.available} icon="restaurant" color={Colors.warning} />
        </View>

        {/* Available Pickups Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Pickups Near You</Text>
        </View>
        {availableTasks.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title="No pickups available"
            subtitle="Check back later for new pickup tasks"
          />
        ) : (
          availableTasks.slice(0, 3).map((task) => (
            <DonationCard key={task._id} donation={task} showDonor />
          ))
        )}

        {/* My Active Pickups */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Active Pickups</Text>
        </View>
        {myTasks.filter((t) => ['matched', 'picked_up'].includes(t.status)).length === 0 ? (
          <EmptyState
            icon="bicycle-outline"
            title="No active pickups"
            subtitle="Accept a pickup task to get started"
          />
        ) : (
          myTasks
            .filter((t) => ['matched', 'picked_up'].includes(t.status))
            .map((task) => (
              <DonationCard
                key={task._id}
                donation={task}
                showDonor
                onPress={() => navigation.navigate('UploadProof', { donation: task })}
              />
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 4,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

export default VolunteerDashboard;
