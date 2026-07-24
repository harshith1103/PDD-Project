import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../../api/axios';
import Colors from '../../utils/colors';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const AvailablePickups = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showRecipientModal, setShowRecipientModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [tasksRes, recipientsRes] = await Promise.all([
        api.get('/volunteers/available-tasks'),
        api.get('/volunteers/recipients'),
      ]);
      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (recipientsRes.data.success) setRecipients(recipientsRes.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
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

  const handleAcceptPress = (task) => {
    setSelectedTask(task);
    setShowRecipientModal(true);
  };

  const handleAccept = async (recipientId) => {
    if (!selectedTask) return;
    setAcceptingId(selectedTask._id);
    setShowRecipientModal(false);
    try {
      const response = await api.put(`/volunteers/tasks/${selectedTask._id}/accept`, {
        recipientId,
      });
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Pickup Accepted! 🎉',
          text2: `You accepted "${selectedTask.foodType}"`,
        });
        fetchData();
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.response?.data?.message || err.message || 'Failed to accept task',
      });
    } finally {
      setAcceptingId(null);
      setSelectedTask(null);
    }
  };

  if (loading && !refreshing) return <LoadingSpinner />;
  if (error && tasks.length === 0) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View>
            <DonationCard donation={item} showDonor />
            <Button
              title={acceptingId === item._id ? 'Accepting...' : 'Accept Pickup'}
              onPress={() => handleAcceptPress(item)}
              loading={acceptingId === item._id}
              disabled={!!acceptingId}
              style={{ marginTop: -4, marginBottom: 12 }}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        contentContainerStyle={[styles.list, tasks.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <EmptyState
            icon="restaurant-outline"
            title="No pickups available"
            subtitle="All donations are matched. Check back later!"
          />
        }
      />

      {/* Recipient Selection Modal */}
      <Modal visible={showRecipientModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Recipient</Text>
            <Text style={styles.modalSubtitle}>
              Choose who will receive "{selectedTask?.foodType}"
            </Text>
            <ScrollView style={styles.recipientList}>
              {recipients.map((recipient) => (
                <Card
                  key={recipient._id}
                  onPress={() => handleAccept(recipient._id)}
                  style={styles.recipientCard}
                >
                  <Text style={styles.recipientName}>{recipient.name}</Text>
                  <Text style={styles.recipientInfo}>{recipient.email}</Text>
                  {recipient.address ? (
                    <Text style={styles.recipientInfo}>📍 {recipient.address}</Text>
                  ) : null}
                </Card>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowRecipientModal(false);
                setSelectedTask(null);
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
  },
  listEmpty: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  recipientList: {
    maxHeight: 300,
  },
  recipientCard: {
    marginBottom: 10,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  recipientInfo: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cancelBtn: {
    backgroundColor: Colors.divider,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default AvailablePickups;
