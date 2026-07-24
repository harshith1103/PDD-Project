import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axios';
import Colors from '../../utils/colors';
import DonationCard from '../../components/donations/DonationCard';
import StatusTimeline from '../../components/donations/StatusTimeline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import { formatDate, getFoodEmoji } from '../../utils/formatters';

const FILTERS = ['All', 'pending', 'matched', 'picked_up', 'delivered', 'cancelled'];

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [selectedDonation, setSelectedDonation] = useState(null);

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

  const filtered = filter === 'All' ? donations : donations.filter((d) => d.status === filter);

  if (loading && !refreshing) return <LoadingSpinner />;
  if (error && donations.length === 0) return <ErrorMessage message={error} onRetry={fetchDonations} />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Filter chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'All' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DonationCard donation={item} onPress={() => setSelectedDonation(item)} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <EmptyState
            icon="restaurant-outline"
            title="No donations found"
            subtitle={filter !== 'All' ? `No ${filter.replace('_', ' ')} donations` : 'You haven\'t created any donations yet'}
          />
        }
      />

      {/* Detail Modal */}
      <Modal visible={!!selectedDonation} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedDonation && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalEmoji}>{getFoodEmoji(selectedDonation.foodType)}</Text>
                    <Text style={styles.modalTitle}>{selectedDonation.foodType}</Text>
                    <Badge status={selectedDonation.status} />
                  </View>

                  <Card style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Quantity</Text>
                    <Text style={styles.detailValue}>{selectedDonation.quantity}</Text>

                    {selectedDonation.description ? (
                      <>
                        <Text style={styles.detailLabel}>Description</Text>
                        <Text style={styles.detailValue}>{selectedDonation.description}</Text>
                      </>
                    ) : null}

                    <Text style={styles.detailLabel}>Pickup Address</Text>
                    <Text style={styles.detailValue}>{selectedDonation.pickupAddress}</Text>

                    <Text style={styles.detailLabel}>Expiry</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedDonation.expiryWindow, true)}</Text>

                    <Text style={styles.detailLabel}>Created</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedDonation.createdAt, true)}</Text>

                    {selectedDonation.matchedVolunteer && (
                      <>
                        <Text style={styles.detailLabel}>Volunteer</Text>
                        <Text style={styles.detailValue}>{selectedDonation.matchedVolunteer.name}</Text>
                      </>
                    )}

                    {selectedDonation.matchedRecipient && (
                      <>
                        <Text style={styles.detailLabel}>Recipient</Text>
                        <Text style={styles.detailValue}>{selectedDonation.matchedRecipient.name}</Text>
                      </>
                    )}
                  </Card>

                  <Text style={styles.timelineTitle}>Status Timeline</Text>
                  <StatusTimeline currentStatus={selectedDonation.status} />
                </>
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedDonation(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.divider,
    marginRight: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textInverse,
  },
  list: {
    padding: 16,
  },
  listEmpty: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  detailCard: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 10,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  closeBtn: {
    backgroundColor: Colors.divider,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default MyDonations;
