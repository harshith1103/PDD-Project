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

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [analyticsRes, donationsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/donations'),
      ]);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (donationsRes.data.success) setDonations(donationsRes.data.data);
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

  if (loading && !refreshing) return <LoadingSpinner />;
  if (error && !analytics) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Admin Dashboard 🛡️</Text>
        <Text style={styles.subGreeting}>Platform overview</Text>

        {/* 2x2 Stats Grid */}
        {analytics && (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                label="Total Donations"
                value={analytics.totalDonations}
                icon="heart"
                color={Colors.primary}
              />
              <StatCard
                label="Delivered"
                value={analytics.delivered}
                icon="checkmark-circle"
                color={Colors.success}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                label="Active Volunteers"
                value={analytics.activeVolunteers}
                icon="people"
                color="#3498DB"
              />
              <StatCard
                label="Pending"
                value={analytics.pending}
                icon="time"
                color={Colors.warning}
              />
            </View>
          </View>
        )}

        {/* Additional Stats */}
        {analytics && (
          <View style={styles.extraStats}>
            <View style={styles.extraStatItem}>
              <Text style={styles.extraStatValue}>{analytics.matched || 0}</Text>
              <Text style={styles.extraStatLabel}>Matched</Text>
            </View>
            <View style={styles.extraStatDivider} />
            <View style={styles.extraStatItem}>
              <Text style={styles.extraStatValue}>{analytics.pickedUp || 0}</Text>
              <Text style={styles.extraStatLabel}>Picked Up</Text>
            </View>
            <View style={styles.extraStatDivider} />
            <View style={styles.extraStatItem}>
              <Text style={styles.extraStatValue}>{analytics.cancelled || 0}</Text>
              <Text style={styles.extraStatLabel}>Cancelled</Text>
            </View>
            <View style={styles.extraStatDivider} />
            <View style={styles.extraStatItem}>
              <Text style={styles.extraStatValue}>{analytics.foodSavedKg || 0} kg</Text>
              <Text style={styles.extraStatLabel}>Food Saved</Text>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        {donations.length === 0 ? (
          <EmptyState
            icon="analytics-outline"
            title="No donations yet"
            subtitle="Platform activity will appear here"
          />
        ) : (
          donations.slice(0, 10).map((donation) => (
            <DonationCard key={donation._id} donation={donation} showDonor />
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
  statsGrid: {
    marginBottom: 16,
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  extraStats: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  extraStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  extraStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  extraStatLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 2,
  },
  extraStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

export default AdminDashboard;
