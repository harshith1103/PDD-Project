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
import api from '../../api/axios';
import Colors from '../../utils/colors';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getStatusColor, formatStatusLabel } from '../../utils/formatters';

const PlatformAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [summaryRes, trendsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/trends'),
      ]);
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (trendsRes.data.success) setTrends(trendsRes.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
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
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  const statusBreakdown = summary
    ? [
        { key: 'pending', label: 'Pending', value: summary.pending, color: getStatusColor('pending') },
        { key: 'matched', label: 'Matched', value: summary.matched, color: getStatusColor('matched') },
        { key: 'picked_up', label: 'Picked Up', value: summary.pickedUp, color: getStatusColor('picked_up') },
        { key: 'delivered', label: 'Delivered', value: summary.delivered, color: getStatusColor('delivered') },
        { key: 'cancelled', label: 'Cancelled', value: summary.cancelled, color: getStatusColor('cancelled') },
      ]
    : [];

  const maxBarValue = Math.max(...statusBreakdown.map((s) => s.value), 1);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Platform Analytics</Text>
        <Text style={styles.subtitle}>Donation status breakdown</Text>

        {/* Bar Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Donations by Status</Text>
          {statusBreakdown.map((item) => (
            <View key={item.key} style={styles.barRow}>
              <Text style={styles.barLabel}>{item.label}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: item.color,
                      width: `${(item.value / maxBarValue) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{item.value}</Text>
            </View>
          ))}
        </Card>

        {/* Summary Stats */}
        {summary && (
          <Card style={styles.summaryCard}>
            <Text style={styles.chartTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Donations</Text>
              <Text style={styles.summaryValue}>{summary.totalDonations}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Active Volunteers</Text>
              <Text style={styles.summaryValue}>{summary.activeVolunteers}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Food Saved</Text>
              <Text style={styles.summaryValue}>{summary.foodSavedKg} kg</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Rate</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                {summary.totalDonations > 0
                  ? `${Math.round((summary.delivered / summary.totalDonations) * 100)}%`
                  : '0%'}
              </Text>
            </View>
          </Card>
        )}

        {/* Trends */}
        {trends.length > 0 && (
          <Card style={styles.trendsCard}>
            <Text style={styles.chartTitle}>Monthly Trends</Text>
            {trends.map((t, idx) => (
              <View key={idx} style={styles.trendRow}>
                <Text style={styles.trendMonth}>{t.month}</Text>
                <View style={styles.trendStats}>
                  <Text style={styles.trendTotal}>{t.total} total</Text>
                  <Text style={styles.trendDelivered}>{t.delivered} delivered</Text>
                </View>
              </View>
            ))}
          </Card>
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    width: 72,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: Colors.divider,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
    minWidth: 4,
  },
  barValue: {
    width: 32,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  trendsCard: {
    marginBottom: 16,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  trendMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  trendStats: {
    flexDirection: 'row',
    gap: 12,
  },
  trendTotal: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  trendDelivered: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '600',
  },
});

export default PlatformAnalytics;
