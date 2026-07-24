import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../utils/colors';

const StatCard = ({ label, value, icon, color = Colors.primary, small = false }) => {
  return (
    <View style={[styles.card, small && styles.cardSmall]}>
      <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={small ? 20 : 24} color={color} />
      </View>
      <Text style={[styles.value, small && styles.valueSmall]}>{value}</Text>
      <Text style={[styles.label, small && styles.labelSmall]} numberOfLines={2}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardSmall: {
    padding: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  valueSmall: {
    fontSize: 20,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: 10,
  },
});

export default StatCard;
