import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../api/axios';
import Colors from '../../utils/colors';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

const AutoMatch = () => {
  const [pendingDonations, setPendingDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [matchingId, setMatchingId] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const fetchPending = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/donations?status=pending');
      if (response.data.success) {
        setPendingDonations(response.data.data.filter((d) => d.status === 'pending'));
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
      fetchPending();
    }, [fetchPending])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPending();
  };

  const handleAutoMatch = async (donationId) => {
    setMatchingId(donationId);
    try {
      const response = await api.post(`/match/${donationId}`);
      if (response.data.success) {
        setLastResult(response.data.message);
        Toast.show({
          type: 'success',
          text1: 'Match Successful! 🎯',
          text2: response.data.message,
        });
        fetchPending();
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Match Failed',
        text2: err.response?.data?.message || err.message || 'Failed to auto-match',
      });
    } finally {
      setMatchingId(null);
    }
  };

  const handleMatchAll = async () => {
    if (pendingDonations.length === 0) return;
    
    Alert.alert(
      'Match All Pending',
      `Auto-match all ${pendingDonations.length} pending donation(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Match All',
          onPress: async () => {
            let matched = 0;
            let failed = 0;
            for (const donation of pendingDonations) {
              try {
                const response = await api.post(`/match/${donation._id}`);
                if (response.data.success) matched++;
                else failed++;
              } catch {
                failed++;
              }
            }
            setLastResult(`Matched ${matched} donation(s). ${failed > 0 ? `${failed} failed.` : ''}`);
            Toast.show({
              type: matched > 0 ? 'success' : 'error',
              text1: 'Batch Match Complete',
              text2: `${matched} matched, ${failed} failed`,
            });
            fetchPending();
          },
        },
      ]
    );
  };

  if (loading && !refreshing) return <LoadingSpinner />;
  if (error && pendingDonations.length === 0) return <ErrorMessage message={error} onRetry={fetchPending} />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Algorithm Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="git-merge" size={28} color={Colors.primary} />
            <Text style={styles.infoTitle}>Auto-Match Algorithm</Text>
          </View>
          <Text style={styles.infoText}>
            The auto-match system uses the Haversine distance formula to find the nearest available
            volunteer and recipient for each pending donation. It matches based on geographic
            proximity to the pickup location.
          </Text>
        </Card>

        {/* Match All Button */}
        <Button
          title={`🎯 Match All Pending (${pendingDonations.length})`}
          onPress={handleMatchAll}
          disabled={pendingDonations.length === 0}
          style={{ marginBottom: 16 }}
        />

        {/* Last result */}
        {lastResult && (
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>Last Result</Text>
            <Text style={styles.resultText}>{lastResult}</Text>
          </Card>
        )}

        {/* Pending Donations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Donations ({pendingDonations.length})</Text>
        </View>

        {pendingDonations.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="All matched!"
            subtitle="No pending donations to match"
          />
        ) : (
          pendingDonations.map((donation) => (
            <View key={donation._id} style={styles.donationItem}>
              <DonationCard donation={donation} showDonor />
              <Button
                title={matchingId === donation._id ? 'Matching...' : 'Auto-Match'}
                onPress={() => handleAutoMatch(donation._id)}
                loading={matchingId === donation._id}
                disabled={!!matchingId}
                variant="secondary"
                style={{ marginTop: -4, marginBottom: 8 }}
              />
            </View>
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
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: Colors.primaryFaded,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  resultCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  resultLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  donationItem: {
    marginBottom: 4,
  },
});

export default AutoMatch;
