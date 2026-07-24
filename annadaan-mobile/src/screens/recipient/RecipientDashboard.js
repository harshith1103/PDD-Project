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

const RecipientDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDonations = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/donations');
      if (response.data.success) {
        setDonations(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load donations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDonations();
    }, [fetchDonations])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDonations();
  };

  const stats = {
    incoming: donations.filter((d) => ['matched', 'picked_up'].includes(d.status)).length,
    received: donations.filter((d) => d.status === 'delivered').length,
    total: donations.length,
  };

  if (loading && !refreshing) return <LoadingSpinner />;
  if (error && donations.length === 0) return <ErrorMessage message={error} onRetry={fetchDonations} />;

  const incomingDonations = donations.filter((d) => ['matched', 'picked_up'].includes(d.status));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Welcome, {user?.name?.split(' ')[0]} 🏠</Text>
        <Text style={styles.subGreeting}>Your incoming donations</Text>

        <View style={styles.statsRow}>
          <StatCard label="Incoming" value={stats.incoming} icon="arrow-down" color={Colors.primary} />
          <StatCard label="Received" value={stats.received} icon="checkmark-circle" color={Colors.success} />
          <StatCard label="Total" value={stats.total} icon="heart" color="#9B59B6" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>On the Way</Text>
        </View>

        {incomingDonations.length === 0 ? (
          <EmptyState
            icon="gift-outline"
            title="No incoming donations"
            subtitle="Donations matched to you will appear here"
          />
        ) : (
          incomingDonations.map((donation) => (
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
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 4,
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

export default RecipientDashboard;
