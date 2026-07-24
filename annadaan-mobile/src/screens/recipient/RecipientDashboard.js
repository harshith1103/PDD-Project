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
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Colors from '../../utils/colors';
import StatCard from '../../components/analytics/StatCard';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

const RecipientDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [requestingId, setRequestingId] = useState(null);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my_requests'

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

  const handleRequestFood = async (donationId, foodType) => {
    setRequestingId(donationId);
    try {
      const response = await api.put(`/donations/${donationId}/request`);
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Food Requested! 🎉',
          text2: `Requested "${foodType}". Volunteers notified for pickup!`,
        });
        await fetchDonations();
        setActiveTab('my_requests');
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: err.response?.data?.message || err.message || 'Failed to request food',
      });
    } finally {
      setRequestingId(null);
    }
  };

  const userId = String(user?._id || user?.id || '');

  // Filter available donor food (status is pending or matched without recipient, not claimed by current user)
  const availableDonations = donations.filter((d) => {
    const recId = String(d.matchedRecipient?._id || d.matchedRecipient || '');
    if (recId === userId) return false;
    if (recId && recId !== userId) return false;
    return ['pending', 'matched'].includes(d.status);
  });

  // Filter claimed/requested food by this recipient
  const claimedDonations = donations.filter((d) => {
    const recId = String(d.matchedRecipient?._id || d.matchedRecipient || '');
    return d.matchedRecipient && recId === userId;
  });

  const stats = {
    available: availableDonations.length,
    incoming: claimedDonations.filter((d) => ['matched', 'picked_up'].includes(d.status)).length,
    received: claimedDonations.filter((d) => d.status === 'delivered').length,
  };

  if (loading && !refreshing) return <LoadingSpinner />;
  if (error && donations.length === 0) return <ErrorMessage message={error} onRetry={fetchDonations} />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Welcome, {user?.name?.split(' ')[0]} 🏠</Text>
        <Text style={styles.subGreeting}>Browse available donor food or manage your requests</Text>

        <View style={styles.statsRow}>
          <StatCard label="Available" value={stats.available} icon="restaurant" color={Colors.warning} />
          <StatCard label="Incoming" value={stats.incoming} icon="arrow-down" color={Colors.primary} />
          <StatCard label="Received" value={stats.received} icon="checkmark-circle" color={Colors.success} />
        </View>

        {/* Tab switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'available' && styles.tabButtonActive]}
            onPress={() => setActiveTab('available')}
          >
            <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
              🍲 Available Food ({availableDonations.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'my_requests' && styles.tabButtonActive]}
            onPress={() => setActiveTab('my_requests')}
          >
            <Text style={[styles.tabText, activeTab === 'my_requests' && styles.tabTextActive]}>
              📦 My Requested ({claimedDonations.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'available' ? (
          <View style={styles.section}>
            {availableDonations.length === 0 ? (
              <EmptyState
                icon="restaurant-outline"
                title="No available food postings"
                subtitle="New surplus food posted by donors will appear here live"
              />
            ) : (
              availableDonations.map((item) => (
                <View key={item._id} style={styles.itemWrapper}>
                  <DonationCard donation={item} showDonor />
                  <Button
                    title={requestingId === item._id ? 'Requesting...' : '🍲 Select & Request This Food'}
                    onPress={() => handleRequestFood(item._id, item.foodType)}
                    loading={requestingId === item._id}
                    disabled={!!requestingId}
                    style={styles.requestBtn}
                  />
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.section}>
            {claimedDonations.length === 0 ? (
              <EmptyState
                icon="gift-outline"
                title="No requested donations"
                subtitle="Food items you select will appear here"
              />
            ) : (
              claimedDonations.map((item) => (
                <View key={item._id} style={styles.itemWrapper}>
                  <DonationCard donation={item} showDonor />
                </View>
              ))
            )}
          </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.divider,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  section: {
    marginTop: 4,
  },
  itemWrapper: {
    marginBottom: 16,
  },
  requestBtn: {
    marginTop: -4,
    marginBottom: 4,
  },
});

export default RecipientDashboard;
