import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Colors from '../../utils/colors';
import { formatDate, formatRelativeTime, getFoodEmoji, getExpiryUrgency } from '../../utils/formatters';

const DonationCard = ({ donation, onPress, showDonor = false, showDistance }) => {
  const expiryUrgency = getExpiryUrgency(donation.expiryWindow);
  const foodEmoji = getFoodEmoji(donation.foodType);

  const getExpiryColor = () => {
    switch (expiryUrgency) {
      case 'expired': return Colors.danger;
      case 'urgent': return Colors.danger;
      case 'soon': return Colors.warning;
      default: return Colors.textSecondary;
    }
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{foodEmoji}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.foodType} numberOfLines={1}>{donation.foodType}</Text>
            <Badge status={donation.status} small />
          </View>
          <Text style={styles.quantity}>{donation.quantity}</Text>
          {showDonor && donation.donor && (
            <Text style={styles.meta}>
              Donor: {donation.donor.name || donation.donor.email || 'Donor'} {donation.donor.phone ? `(${donation.donor.phone})` : ''}
            </Text>
          )}
          {donation.matchedRecipient && (
            <View style={styles.recipientBox}>
              <Text style={styles.recipientMeta}>
                🏠 Recipient: {donation.matchedRecipient.name} {donation.matchedRecipient.phone ? `(${donation.matchedRecipient.phone})` : ''}
              </Text>
              {donation.matchedRecipient.address && (
                <Text style={styles.recipientAddress} numberOfLines={1}>
                  Deliver To: {donation.matchedRecipient.address}
                </Text>
              )}
            </View>
          )}
          <View style={styles.footerRow}>
            <Text style={[styles.expiry, { color: getExpiryColor() }]}>
              {expiryUrgency === 'expired' ? '⚠ Expired' : `Expires ${formatRelativeTime(donation.expiryWindow)}`}
            </Text>
            {showDistance && (
              <Text style={styles.distance}>{showDistance}</Text>
            )}
          </View>
          {donation.pickupAddress && (
            <Text style={styles.address} numberOfLines={1}>
              📍 Pickup: {donation.pickupAddress}
            </Text>
          )}
          <Text style={styles.created}>{formatDate(donation.createdAt)}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  foodType: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  quantity: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  recipientBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 6,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  recipientMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  recipientAddress: {
    fontSize: 11,
    color: '#1E3A8A',
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  expiry: {
    fontSize: 12,
    fontWeight: '500',
  },
  distance: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  address: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  created: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});

export default DonationCard;
