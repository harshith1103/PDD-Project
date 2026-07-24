import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import api from '../../api/axios';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Colors from '../../utils/colors';
import { formatDate } from '../../utils/formatters';

const CreateDonation = ({ navigation }) => {
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [expiryWindow, setExpiryWindow] = useState(new Date(Date.now() + 6 * 3600000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!foodType.trim()) errs.foodType = 'Food type is required';
    if (!quantity.trim()) errs.quantity = 'Quantity is required';
    if (!pickupAddress.trim()) errs.pickupAddress = 'Pickup address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        foodType: foodType.trim(),
        quantity: quantity.trim(),
        description: description.trim(),
        pickupAddress: pickupAddress.trim(),
        pickupLocation: {
          lat: parseFloat(lat) || 0,
          lng: parseFloat(lng) || 0,
        },
        expiryWindow: expiryWindow.toISOString(),
      };
      const response = await api.post('/donations', data);
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Donation Created! 🎉',
          text2: 'Your food donation has been submitted successfully',
        });
        navigation.goBack();
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || err.message || 'Failed to create donation',
      });
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiryWindow(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🍱</Text>
            <Text style={styles.headerTitle}>Donate Food</Text>
            <Text style={styles.headerSubtitle}>Fill in the details about your food donation</Text>
          </View>

          <Input
            label="Food Type *"
            value={foodType}
            onChangeText={setFoodType}
            placeholder="e.g. Rice and Dal, Fresh Fruits"
            error={errors.foodType}
          />

          <Input
            label="Quantity *"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g. 15 kg, 50 meals, 10 liters"
            error={errors.quantity}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Any additional details about the food..."
            multiline
            numberOfLines={3}
          />

          <Input
            label="Pickup Address *"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            placeholder="Full pickup address"
            error={errors.pickupAddress}
          />

          <Text style={styles.label}>Pickup Location</Text>
          <View style={styles.locationRow}>
            <View style={styles.locationInput}>
              <Input
                label="Latitude"
                value={lat}
                onChangeText={setLat}
                placeholder="12.97"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.locationInput}>
              <Input
                label="Longitude"
                value={lng}
                onChangeText={setLng}
                placeholder="77.60"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Expiry Picker */}
          <Text style={styles.label}>Expiry Window</Text>
          <Button
            title={`📅 ${formatDate(expiryWindow.toISOString(), true)}`}
            onPress={() => setShowDatePicker(true)}
            variant="secondary"
            style={{ marginBottom: 16 }}
          />
          {showDatePicker && (
            <DateTimePicker
              value={expiryWindow}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <Button
            title="Submit Donation"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: 8, marginBottom: 20 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationInput: {
    flex: 1,
  },
});

export default CreateDonation;
