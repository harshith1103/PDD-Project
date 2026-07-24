import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Colors from '../../utils/colors';

const Card = ({ children, style, onPress, noPadding = false }) => {
  const cardContent = (
    <View style={[styles.card, noPadding ? styles.noPadding : styles.withPadding, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  withPadding: {
    padding: 16,
  },
  noPadding: {
    padding: 0,
  },
});

export default Card;
