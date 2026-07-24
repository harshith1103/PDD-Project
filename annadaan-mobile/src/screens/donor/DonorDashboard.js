import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Colors from '../../utils/colors';
import StatCard from '../../components/analytics/StatCard';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

const DonorDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDonations = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/donations/my');
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
    total: donations.length,
    delivered: donations.filter((d) => d.status === 'delivered').length,
    pending: donations.filter((d) => d.status === 'pending').length,
  };

  if (loading && !refreshing) return <LoadingSpinner />;
  if (error && donations.length === 0) return <ErrorMessage message={error} onRetry={fetchDonations} />;

  const recentDonations = donations.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={styles.greeting}>Welcome, {user?.name?.split(' ')[0]} 🙏</Text>
        <Text style={styles.subGreeting}>Your food donation dashboard</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Total" value={stats.total} icon="heart" color={Colors.primary} />
          <StatCard label="Delivered" value={stats.delivered} icon="checkmark-circle" color={Colors.success} />
          <StatCard label="Pending" value={stats.pending} icon="time" color={Colors.warning} />
        </View>

        {/* Create new */}
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateDonation')}
          activeOpacity={0.8}
        >
          <View style={styles.createBtnInner}>
            <Ionicons name="add-circle" size={24} color={Colors.textInverse} />
            <Text style={styles.createBtnText}>Create New Donation</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textInverse} />
        </TouchableOpacity>

        {/* Recent Donations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Donations</Text>
        </View>

        {recentDonations.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title="No donations yet"
            subtitle="Start making a difference by creating your first food donation"
            actionLabel="Create Donation"
            onAction={() => navigation.navigate('CreateDonation')}
          />
        ) : (
          recentDonations.map((donation) => (
            <DonationCard key={donation._id} donation={donation} />
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
    marginBottom: 20,
    gap: 4,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  createBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createBtnText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
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

export default DonorDashboard;
