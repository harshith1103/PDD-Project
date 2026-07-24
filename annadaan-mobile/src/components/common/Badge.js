import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatStatusLabel, getStatusColor } from '../../utils/formatters';

const Badge = ({ status, small = false }) => {
  const color = getStatusColor(status);
  const label = formatStatusLabel(status);

  return (
    <View style={[styles.badge, { backgroundColor: color }, small && styles.badgeSmall]}>
      <Text style={[styles.text, small && styles.textSmall]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 9,
  },
});

export default Badge;
