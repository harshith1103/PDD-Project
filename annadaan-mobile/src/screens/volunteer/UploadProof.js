import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import api from '../../api/axios';
import Colors from '../../utils/colors';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { formatDate, getFoodEmoji } from '../../utils/formatters';

const UploadProof = ({ route, navigation }) => {
  const { donation } = route.params;
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [delivering, setDelivering] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll access is required to upload proof.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleMarkDelivered = async () => {
    setDelivering(true);
    try {
      // Upload proof if image selected
      if (imageUri) {
        await api.post(`/donations/${donation._id}/proof`, {
          proofOfDelivery: imageUri,
        });
      }

      // Mark as delivered
      const response = await api.put(`/donations/${donation._id}/status`, {
        status: 'delivered',
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Delivered! 🎉',
          text2: 'Donation has been marked as delivered',
        });
        navigation.goBack();
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || err.message || 'Failed to update status',
      });
    } finally {
      setDelivering(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Donation Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.emoji}>{getFoodEmoji(donation.foodType)}</Text>
            <View style={styles.infoText}>
              <Text style={styles.foodType}>{donation.foodType}</Text>
              <Text style={styles.quantity}>{donation.quantity}</Text>
            </View>
            <Badge status={donation.status} />
          </View>
          <View style={styles.divider} />
          <Text style={styles.detailLabel}>Pickup</Text>
          <Text style={styles.detailValue}>{donation.pickupAddress || 'N/A'}</Text>

          {donation.matchedRecipient && (
            <>
              <Text style={styles.detailLabel}>Recipient</Text>
              <Text style={styles.detailValue}>
                {donation.matchedRecipient.name}{donation.matchedRecipient.address ? ` — ${donation.matchedRecipient.address}` : ''}
              </Text>
            </>
          )}

          <Text style={styles.detailLabel}>Expiry</Text>
          <Text style={styles.detailValue}>{formatDate(donation.expiryWindow, true)}</Text>
        </Card>

        {/* Image Section */}
        <Text style={styles.sectionTitle}>Proof of Delivery</Text>

        {imageUri ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <Button
              title="Change Photo"
              onPress={pickImage}
              variant="secondary"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <View style={styles.imageButtons}>
            <Button
              title="📷 Take Photo"
              onPress={takePhoto}
              variant="secondary"
              style={{ marginBottom: 10 }}
            />
            <Button
              title="🖼️ Choose from Gallery"
              onPress={pickImage}
              variant="secondary"
            />
          </View>
        )}

        {/* Action */}
        <Button
          title="Mark as Delivered"
          onPress={handleMarkDelivered}
          loading={delivering}
          style={{ marginTop: 24 }}
        />
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
    paddingBottom: 40,
  },
  infoCard: {
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  foodType: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quantity: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  imageButtons: {},
  imagePreview: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    resizeMode: 'cover',
  },
});

export default UploadProof;
