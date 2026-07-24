import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../../api/axios';
import Colors from '../../utils/colors';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const IncomingDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

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

  const handleConfirm = async (donationId) => {
    Alert.alert(
      'Confirm Receipt',
      'Are you sure you have received this donation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setConfirmingId(donationId);
            try {
              // The backend doesn't have a dedicated "confirmed" status,
              // but delivered is the terminal positive status for recipients
              const response = await api.put(`/donations/${donationId}/status`, {
                status: 'delivered',
              });
              if (response.data.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Receipt Confirmed! 🎉',
                  text2: 'Thank you for confirming delivery',
                });
                fetchDonations();
              }
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err.response?.data?.message || err.message || 'Failed to confirm',
              });
            } finally {
              setConfirmingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) return <LoadingSpinner />;
  if (error && donations.length === 0) return <ErrorMessage message={error} onRetry={fetchDonations} />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={donations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <DonationCard donation={item} showDonor />
            {item.matchedVolunteer ? (
              <View style={styles.volunteerInfo}>
                <Text style={styles.volunteerLabel}>Volunteer: </Text>
                <Text style={styles.volunteerName}>{item.matchedVolunteer.name}</Text>
              </View>
            ) : null}
            {item.status === 'delivered' ? (
              <Button
                title={confirmingId === item._id ? 'Confirming...' : '✅ Confirm Receipt'}
                onPress={() => handleConfirm(item._id)}
                loading={confirmingId === item._id}
                disabled={!!confirmingId}
                variant="secondary"
                style={{ marginTop: 4, marginBottom: 8 }}
              />
            ) : null}
            {item.status === 'picked_up' ? (
              <View style={styles.etaContainer}>
                <Text style={styles.etaText}>🚴 On the way to you...</Text>
              </View>
            ) : null}
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        contentContainerStyle={[styles.list, donations.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <EmptyState
            icon="gift-outline"
            title="No incoming donations"
            subtitle="Donations assigned to you will appear here"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
  },
  listEmpty: {
    flexGrow: 1,
  },
  itemContainer: {
    marginBottom: 4,
  },
  volunteerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  volunteerLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  volunteerName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  etaContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  etaText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default IncomingDonations;
