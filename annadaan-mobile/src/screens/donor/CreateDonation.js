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
    try {
      setShowDatePicker(Platform.OS === 'ios');
      if (selectedDate) {
        setExpiryWindow(selectedDate);
      }
    } catch {
      setShowDatePicker(false);
    }
  };

  const handleSetHours = (hours) => {
    setExpiryWindow(new Date(Date.now() + hours * 3600000));
    setShowDatePicker(false);
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
            placeholder="e.g. Cooked Rice, Vegetables, Fruits"
            error={errors.foodType}
          />

          <Input
            label="Quantity *"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g. 10 kg, 20 servings"
            error={errors.quantity}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Optional details about freshness, packaging, etc."
            multiline
            numberOfLines={3}
          />

          <Input
            label="Pickup Address *"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            placeholder="e.g. MG Road, Bangalore"
            error={errors.pickupAddress}
          />

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

          {/* Expiry Window */}
          <Text style={styles.label}>Expiry Window *</Text>
          <View style={styles.hoursContainer}>
            {[
              { label: '3h', hours: 3 },
              { label: '6h', hours: 6 },
              { label: '12h', hours: 12 },
              { label: '24h', hours: 24 },
            ].map((item) => {
              const targetTime = Date.now() + item.hours * 3600000;
              const isSelected = Math.abs(expiryWindow.getTime() - targetTime) < 300000;
              return (
                <TouchableOpacity
                  key={item.hours}
                  style={[styles.hourChip, isSelected && styles.hourChipSelected]}
                  onPress={() => handleSetHours(item.hours)}
                >
                  <Text style={[styles.hourText, isSelected && styles.hourTextSelected]}>
                    +{item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title={`📅 ${formatDate(expiryWindow.toISOString(), true)}`}
            onPress={() => {
              try {
                setShowDatePicker(true);
              } catch {
                setShowDatePicker(false);
              }
            }}
            variant="secondary"
            style={{ marginBottom: 16 }}
          />

          {showDatePicker ? (
            <DateTimePicker
              value={expiryWindow}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          ) : null}

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
  hoursContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  hourChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  hourChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaded,
  },
  hourText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  hourTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default CreateDonation;
