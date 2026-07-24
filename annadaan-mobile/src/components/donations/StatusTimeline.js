import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../utils/colors';
import { getStatusColor, formatStatusLabel } from '../../utils/formatters';

const STATUSES = ['pending', 'matched', 'picked_up', 'delivered'];

const StatusTimeline = ({ currentStatus }) => {
  const currentIdx = STATUSES.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <View style={styles.container}>
      {STATUSES.map((status, idx) => {
        const isCompleted = !isCancelled && idx <= currentIdx;
        const isActive = !isCancelled && idx === currentIdx;
        const color = isCompleted ? getStatusColor(status) : Colors.border;

        return (
          <View key={status} style={styles.step}>
            <View style={styles.stepRow}>
              <View style={[styles.dot, { backgroundColor: color }, isActive && styles.dotActive]}>
                {isCompleted && (
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {formatStatusLabel(status)}
                </Text>
              </View>
            </View>
            {idx < STATUSES.length - 1 && (
              <View style={[styles.line, { backgroundColor: isCompleted && idx < currentIdx ? getStatusColor(STATUSES[idx + 1]) : Colors.border }]} />
            )}
          </View>
        );
      })}
      {isCancelled && (
        <View style={styles.step}>
          <View style={styles.stepRow}>
            <View style={[styles.dot, { backgroundColor: Colors.danger }]}>
              <Ionicons name="close" size={12} color="#FFF" />
            </View>
            <Text style={[styles.stepLabel, { color: Colors.danger, fontWeight: '700' }]}>
              Cancelled
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  step: {
    marginLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: 'rgba(230,126,34,0.2)',
  },
  stepContent: {
    marginLeft: 12,
  },
  stepLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  line: {
    width: 2,
    height: 20,
    marginLeft: 10,
    marginVertical: 2,
  },
});

export default StatusTimeline;
